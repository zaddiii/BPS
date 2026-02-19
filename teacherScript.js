
(async () => {

/*********************************
 * SUPABASE INIT
 *********************************/
const SUPABASE_URL = "https://irelkjvppoisvjpopdpb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZWxranZwcG9pc3ZqcG9wZHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTUwMDAsImV4cCI6MjA4MTkzMTAwMH0.osF4wEZ-zm3cXScD1W8gMOkG81O2TbDJ8L47YvIIryw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/*********************************
 * AUTH GUARD
 *********************************/
const { data: { session } } = await supabaseClient.auth.getSession();

if (!session) {
  window.location.replace("index.html");
  return;
}

const userId = session.user.id;

// Check if teacher already linked
const { data: teacher } = await supabaseClient
  .from("teachers")
  .select("*")
  .eq("auth_id", userId)
  .single();

if (!teacher) {
  // First login — link by email
  const { data: emailMatch } = await supabaseClient
    .from("teachers")
    .select("*")
    .eq("email", session.user.email)
    .single();

  if (emailMatch) {
    await supabaseClient
      .from("teachers")
      .update({ auth_id: userId })
      .eq("id", emailMatch.id);
  } else {
    alert("No teacher record found.");
    await supabaseClient.auth.signOut();
    window.location.replace("index.html");
  }
}

/*********************************
 * DOM ELEMENTS
 *********************************/
const teacherNameEl = document.getElementById("teacherName");
const teacherIdEl = document.getElementById("teacherIdDisplay");
const assignedClassesCountEl = document.getElementById("assignedClassesCount");
const totalStudentsCountEl = document.getElementById("totalStudentsCount");
const subjectsCountEl = document.getElementById("subjectsCount");

/*********************************
 * GLOBAL STATE
 *********************************/
let allStudents = [];
let selectedStudent = null;

/*********************************
 * LOAD TEACHER OVERVIEW (RLS SAFE)
 *********************************/
async function loadTeacherOverview() {
  // RLS ensures only this teacher row is returned
  const { data: teacher, error } = await supabaseClient
    .from("teachers")
    .select("full_name, assigned_classes")
    .single();

  if (error || !teacher) {
    console.error("Failed to load teacher profile:", error);
    return;
  }

  teacherNameEl.textContent = teacher.full_name;
  teacherIdEl.textContent = "Teacher";

  const classes = teacher.assigned_classes
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);

  assignedClassesCountEl.textContent = classes.length;

  // STUDENTS COUNT (already filtered by RLS)
  const { data: students } = await supabaseClient
    .from("students")
    .select("id");

  totalStudentsCountEl.textContent = students?.length || 0;

  // SUBJECTS COUNT (already filtered by RLS if policy exists)
  const { data: subjects } = await supabaseClient
    .from("subjects")
    .select("id");

  subjectsCountEl.textContent = subjects?.length || 0;
}

/*********************************
 * FETCH STUDENTS (NO FILTERING)
 *********************************/
async function fetchStudents() {
  try {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allStudents = data;
    loadStudents(allStudents);
    populateClassFilterFromStudents(allStudents);
  } catch (err) {
    console.error("Error fetching students:", err.message);
  }
}

/*********************************
 * CLASS FILTER (UI ONLY)
 *********************************/
function populateClassFilterFromStudents(students) {
  const classFilter = document.getElementById("studentClassFilter");
  if (!classFilter) return;

  const classes = [...new Set(students.map(s => s.student_class).filter(Boolean))];

  classFilter.innerHTML = `<option value="all">All</option>`;
  classes.forEach(cls => {
    const option = document.createElement("option");
    option.value = cls;
    option.textContent = cls;
    classFilter.appendChild(option);
  });
}

/*********************************
 * LOAD STUDENTS UI
 *********************************/
function loadStudents(list = allStudents) {
  const container = document.getElementById("studentsContainer");
  if (!container) return;

  container.innerHTML = "";
  container.className = "grid gap-4 mt-4";

  if (!list.length) {
    container.innerHTML = "<p>No students found.</p>";
    return;
  }

  list.forEach(student => {
    const card = document.createElement("div");
    card.className = "data-card cursor-pointer";

    card.innerHTML = `
      <div class="data-card-header">
        <div class="card-avatar">${student.full_name?.charAt(0) || "S"}</div>
        <div class="card-info">
          <h4>${student.full_name || "Unnamed Student"}</h4>
          <p>ID: ${student.student_id || "N/A"}</p>
          <p>Class: ${student.student_class || "N/A"}</p>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openStudentModal(student));
    container.appendChild(card);
  });
}

/*********************************
 * STUDENT MODAL
 *********************************/
function openStudentModal(student) {
  selectedStudent = student;

  let modal = document.getElementById("studentDetailModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "studentDetailModal";
    modal.className = "modal fixed inset-0 flex items-center justify-center bg-black/50 z-50";
    modal.innerHTML = `
      <div class="modal-content bg-white p-6 rounded-lg w-[500px] max-w-full relative">
        <button id="closeStudentModal" class="absolute top-2 right-2">X</button>
        <div id="studentDetailContent"></div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("closeStudentModal").onclick = closeStudentModal;
    modal.onclick = e => e.target === modal && closeStudentModal();
  }

  document.getElementById("studentDetailContent").innerHTML = `
    <h2 class="text-xl font-bold mb-2">${student.full_name}</h2>
    <p><strong>ID:</strong> ${student.student_id}</p>
    <p><strong>Class:</strong> ${student.student_class}</p>
    <p><strong>Sex:</strong> ${student.sex || "N/A"}</p>
    <p><strong>Date of Birth:</strong> ${student.date_of_birth || "N/A"}</p>
  `;

  modal.style.display = "flex";
}

function closeStudentModal() {
  const modal = document.getElementById("studentDetailModal");
  if (modal) modal.style.display = "none";
}

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", async () => {
  await loadTeacherOverview();
  await fetchStudents();

  const classFilter = document.getElementById("studentClassFilter");
  if (classFilter) {
    classFilter.addEventListener("change", e => {
      const value = e.target.value;
      if (value === "all") {
        loadStudents(allStudents);
      } else {
        loadStudents(allStudents.filter(s => s.student_class === value));
      }
    });
  }
});

/*********************************
 * NAVIGATION
 *********************************/
const navLinks = document.getElementById("navLinks");
document.getElementById("hamburger").onclick = () =>
  navLinks.classList.toggle("active");

function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");
  navLinks.classList.remove("active");
}

})();