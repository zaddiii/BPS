
const API_URL = "https://bps-qgmn.onrender.com";

let allStudents = []; // full list from backend
let allTeachers = []; // full list from backend

document.addEventListener('DOMContentLoaded', () => {
  // basic UI handlers
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const activeSection = document.querySelector('.section.active');
  if (!activeSection) document.getElementById('register')?.classList.add('active');

  // initialize modules
  setupStudentManagement();
  setupTeacherManagement();
  setupTransferSection();
  setupSubjectsSection();
  setupResultsSection();
  setupRegistrationForm();

  // initial fetch
  fetchStudents();
  fetchTeachers();
});

/* -------------------------
   FETCH / GLOBAL UPDATES
   ------------------------- */
async function fetchStudents() {
  try {
    const res = await fetch(`${API_URL}/api/admin/students`);
    const data = await res.json();
    // some APIs return { success, data } - handle both shapes
    allStudents = Array.isArray(data) ? data : (data.data || []);
    // render into the card container and update other dropdowns
    loadStudents(document.getElementById('studentClassFilter')?.value || 'all');
    populateResultDropdowns();
    populateTransferDropdownFromAll();
  } catch (err) {
    console.error('fetchStudents error', err);
  }
}

async function fetchTeachers() {
  try {
    const res = await fetch(`${API_URL}/api/teachers`);
    const data = await res.json();
    allTeachers = Array.isArray(data) ? data : (data.data || []);
    loadTeachers();
    populateResultDropdowns();
  } catch (err) {
    console.error('fetchTeachers error', err);
  }
}

/* -------------------------
   STUDENT CARDS (MANAGE)
   ------------------------- */
function setupStudentManagement() {
  const filter = document.getElementById('studentClassFilter');
  if (filter) {
    filter.addEventListener('change', () => {
      loadStudents(filter.value);
    });
  }

  // edit modal close
  const closeStudentModalBtn = document.getElementById('closeStudentModal');
  if (closeStudentModalBtn) {
    closeStudentModalBtn.addEventListener('click', () => {
      document.getElementById('editStudentModal').classList.add('hidden');
    });
  }

  // submit edit student modal
  const editStudentForm = document.getElementById('editStudentForm');
  if (editStudentForm) {
    editStudentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const studentId = editStudentForm.studentId.value;
      const payload = {
        fullName: editStudentForm.fullName.value,
        dateOfBirth: editStudentForm.dateOfBirth.value,
        nationality: editStudentForm.nationality.value,
        parentName: editStudentForm.parentName.value,
        parentPhone: editStudentForm.parentPhone.value,
        guardianName: editStudentForm.guardianName.value,
        guardianPhone: editStudentForm.guardianPhone.value,
        lga: editStudentForm.lga.value,
        studentClass: editStudentForm.studentClass.value
      };
      try {
        const res = await fetch(`${API_URL}/api/admin/students/${studentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          alert('Student updated!');
          document.getElementById('editStudentModal').classList.add('hidden');
          await fetchStudents();
        } else {
          alert(result.message || 'Failed to update student.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
      }
    });
  }
}

async function loadStudents(filterClass = 'all') {
  const container = document.getElementById('studentsContainer');
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';

  try {
    // Use the cached allStudents if available; otherwise fetch fresh
    if (!allStudents || allStudents.length === 0) {
      await fetchStudents();
    }

    let list = allStudents || [];
    if (filterClass && filterClass !== 'all') {
      list = list.filter(s => (s.studentClass || '').toLowerCase() === (filterClass || '').toLowerCase());
    }

    container.innerHTML = '';
    if (!list || list.length === 0) {
      container.innerHTML = '<p>No students found.</p>';
      return;
    }

    list.forEach(student => {
      const card = document.createElement('div');
      card.className = 'p-4 border rounded shadow bg-white';
      card.innerHTML = `
        <h3 class="text-lg font-bold mb-2">${escapeHtml(student.fullName || '')} (${escapeHtml(student.studentId || '-')})</h3>
        <p><strong>DOB:</strong> ${escapeHtml(student.dateOfBirth || '-')}</p>
        <p><strong>Sex:</strong> ${escapeHtml(student.sex || '-')}</p>
        <p><strong>Class:</strong> ${escapeHtml(student.studentClass || '-')}</p>
        <p><strong>Admission Class:</strong> ${escapeHtml(student.admissionClass || '-')}</p>
        <p><strong>State of Origin:</strong> ${escapeHtml(student.stateOfOrigin || '-')}</p>
        <p><strong>Nationality:</strong> ${escapeHtml(student.nationality || '-')}</p>
        <p><strong>LGA:</strong> ${escapeHtml(student.lga || '-')}</p>
        <p><strong>Address:</strong> ${escapeHtml(student.studentAddress || '-')}</p>
        <p><strong>Parent Name:</strong> ${escapeHtml(student.parentName || '-')}</p>
        <p><strong>Parent Phone:</strong> ${escapeHtml(student.parentPhone || '-')}</p>
        <p><strong>Parent Email:</strong> ${escapeHtml(student.parentEmail || '-')}</p>
        <p><strong>Guardian Name:</strong> ${escapeHtml(student.guardianName || '-')}</p>
        <p><strong>Guardian Phone:</strong> ${escapeHtml(student.guardianPhone || '-')}</p>
        <p><strong>Guardian Email:</strong> ${escapeHtml(student.guardianEmail || '-')}</p>
        <div class="flex gap-2 mt-3">
          <button class="action-btn edit-btn" onclick="openEditStudentModal('${encodeURIComponent(student.studentId || '')}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteStudent('${encodeURIComponent(student.studentId || '')}')">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error('loadStudents error', err);
    container.innerHTML = '<p>Failed to load students.</p>';
  }
}

// helper for opening modal using studentId
window.openEditStudentModal = async function(studentIdEncoded) {
  const studentId = decodeURIComponent(studentIdEncoded);
  try {
    const res = await fetch(`${API_URL}/api/admin/students/${studentId}`);
    const student = await res.json();
    const form = document.getElementById('editStudentForm');
    if (!form) return;
    form.fullName.value = student.fullName || '';
    form.studentId.value = student.studentId || '';
    form.dateOfBirth.value = student.dateOfBirth || '';
    form.nationality.value = student.nationality || '';
    form.parentName.value = student.parentName || '';
    form.parentPhone.value = student.parentPhone || '';
    form.guardianName.value = student.guardianName || '';
    form.guardianPhone.value = student.guardianPhone || '';
    form.lga.value = student.lga || '';
    form.studentClass.value = student.studentClass || '';
    document.getElementById('editStudentModal').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Failed to fetch student details.');
  }
};

async function deleteStudent(studentIdEncoded) {
  const studentId = decodeURIComponent(studentIdEncoded);
  if (!confirm('Are you sure you want to delete this student?')) return;
  try {
    const res = await fetch(`${API_URL}/api/admin/students/${studentId}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      alert('Student deleted');
      await fetchStudents();
    } else {
      alert(result.message || 'Failed to delete student.');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect to server.');
  }
}

/* -------------------------
   TEACHER CARDS (MANAGE)
   ------------------------- */
function setupTeacherManagement() {
  // edit modal close
  const closeTeacherModalBtn = document.getElementById('closeTeacherModal');
  if (closeTeacherModalBtn) {
    closeTeacherModalBtn.addEventListener('click', () => {
      document.getElementById('editTeacherModal').classList.add('hidden');
    });
  }

  // submit edit teacher modal
  const editTeacherForm = document.getElementById('editTeacherForm');
  if (editTeacherForm) {
    editTeacherForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const teacherId = editTeacherForm.teacherId?.value || editTeacherForm.querySelector('[name="teacherId"]')?.value;
      if (!teacherId) {
        alert('Missing teacher id.');
        return;
      }
      const payload = {
        fullName: editTeacherForm.fullName.value,
        phone: editTeacherForm.phone.value,
        email: editTeacherForm.email.value,
        qualification: editTeacherForm.qualification.value,
        subjectSpecialization: editTeacherForm.subjectSpecialization.value,
        classTeacher: editTeacherForm.classTeacher.value,
        yearsOfExperience: editTeacherForm.yearsOfExperience.value,
        joiningDate: editTeacherForm.joiningDate.value
      };
      try {
        const res = await fetch(`${API_URL}/api/teachers/${encodeURIComponent(teacherId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          alert('Teacher updated!');
          document.getElementById('editTeacherModal').classList.add('hidden');
          await fetchTeachers();
        } else {
          alert(result.message || 'Failed to update teacher.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
      }
    });
  }
}

async function loadTeachers() {
  const container = document.getElementById('teachersContainer');
  if (!container) return;
  container.innerHTML = '<p>Loading...</p>';

  try {
    if (!allTeachers || allTeachers.length === 0) {
      await fetchTeachers();
    }

    container.innerHTML = '';
    if (!allTeachers || allTeachers.length === 0) {
      container.innerHTML = '<p>No teachers found.</p>';
      return;
    }

    allTeachers.forEach(teacher => {
      const card = document.createElement('div');
      card.className = 'p-4 border rounded shadow bg-white';
      card.innerHTML = `
        <h3 class="text-lg font-bold mb-2">${escapeHtml(teacher.fullName || '')} (${escapeHtml(teacher.teacherId || '-')})</h3>
        <p><strong>Phone:</strong> ${escapeHtml(teacher.phone || '-')}</p>
        <p><strong>Email:</strong> ${escapeHtml(teacher.email || '-')}</p>
        <p><strong>Qualification:</strong> ${escapeHtml(teacher.qualification || '-')}</p>
        <p><strong>Subject:</strong> ${escapeHtml(teacher.subjectSpecialization || '-')}</p>
        <p><strong>Class Teacher:</strong> ${escapeHtml(teacher.classTeacher || '-')}</p>
        <p><strong>Years Experience:</strong> ${escapeHtml(teacher.yearsOfExperience || '-')}</p>
        <p><strong>Joining Date:</strong> ${escapeHtml(teacher.joiningDate || '-')}</p>
        <div class="flex gap-2 mt-3">
          <button class="action-btn edit-btn" onclick="openEditTeacherModal('${encodeURIComponent(teacher.teacherId || '')}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteTeacher('${encodeURIComponent(teacher.teacherId || '')}')">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error('loadTeachers error', err);
    container.innerHTML = '<p>Failed to load teachers.</p>';
  }
}

window.openEditTeacherModal = async function(teacherIdEncoded) {
  const teacherId = decodeURIComponent(teacherIdEncoded);
  try {
    const res = await fetch(`${API_URL}/api/teachers/${teacherId}`);
    const teacher = await res.json();
    const form = document.getElementById('editTeacherForm');
    if (!form) return;
    // ensure the modal form has a teacherId field; if not, create one hidden
    if (!form.teacherId) {
      const hid = document.createElement('input');
      hid.type = 'hidden';
      hid.name = 'teacherId';
      form.appendChild(hid);
    }
    form.teacherId.value = teacher.teacherId || '';
    form.fullName.value = teacher.fullName || '';
    form.phone.value = teacher.phone || '';
    form.email.value = teacher.email || '';
    form.qualification.value = teacher.qualification || '';
    form.subjectSpecialization.value = teacher.subjectSpecialization || '';
    form.classTeacher.value = teacher.classTeacher || '';
    form.yearsOfExperience.value = teacher.yearsOfExperience || '';
    form.joiningDate.value = teacher.joiningDate || '';
    document.getElementById('editTeacherModal').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Failed to fetch teacher details.');
  }
};

async function deleteTeacher(teacherIdEncoded) {
  const teacherId = decodeURIComponent(teacherIdEncoded);
  if (!confirm('Are you sure you want to delete this teacher?')) return;
  try {
    const res = await fetch(`${API_URL}/api/teachers/${teacherId}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      alert('Teacher deleted!');
      await fetchTeachers();
    } else {
      alert(result.message || 'Failed to delete teacher.');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect to server.');
  }
}

/* -------------------------
   TRANSFER SECTION
   ------------------------- */
function setupTransferSection() {
  const classSelect = document.getElementById("transferClass");
  const studentSelect = document.getElementById("transferStudent");

  if (!classSelect || !studentSelect) return;

  classSelect.addEventListener("change", () => {
    const selectedClass = classSelect.value;
    studentSelect.innerHTML = `<option value="">--Select Student--</option>`;
    if (!selectedClass) return;

    // ensure we have latest students
    const filtered = (allStudents || []).filter(
      s => (s.studentClass || '').toLowerCase() === selectedClass.toLowerCase()
    );

    filtered.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.studentId;
      opt.textContent = `${s.fullName} (${s.studentId})`;
      studentSelect.appendChild(opt);
    });
  });

  const transferForm = document.getElementById("transferForm");
  if (transferForm) {
    transferForm.addEventListener("submit", async e => {
      e.preventDefault();
      const studentId = document.getElementById("transferStudent").value;
      const newClass = document.getElementById("newClass").value;
      const fromClass = document.getElementById("transferClass").value;
      if (!fromClass) { alert("Please select class first."); return; }
      if (!studentId) { alert("Please select a student."); return; }
      if (!newClass) { alert("Please select the new class."); return; }

      try {
        const res = await fetch(`${API_URL}/api/admin/students/${studentId}/transfer`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentClass: newClass })
        });
        const result = await res.json();
        if (result.success) {
          alert("Student transferred successfully!");
          await fetchStudents();
          transferForm.reset();
          studentSelect.innerHTML = `<option value="">--Select Student--</option>`;
        } else {
          alert(result.message || "Failed to transfer student.");
        }
      } catch (err) {
        console.error(err);
        alert("Error: Unable to connect to server.");
      }
    });
  }
}

function populateTransferDropdownFromAll() {
  const transferSelect = document.getElementById('transferStudent');
  if (!transferSelect) return;
  transferSelect.innerHTML = '<option value="">--Select Student--</option>';
  (allStudents || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.studentId;
    opt.textContent = `${s.fullName} (${s.studentClass || '-'})`;
    transferSelect.appendChild(opt);
  });
}

/* -------------------------
   SUBJECTS SECTION
   ------------------------- */
function setupSubjectsSection() {
  const subjectForm = document.getElementById('subjectForm');
  const subjectClassSelect = document.getElementById('subjectClass');
  const registeredSubjectsContainer = document.getElementById('registeredSubjects');

  if (!subjectForm || !subjectClassSelect) return;

  subjectForm.addEventListener('submit', async e => {
    e.preventDefault();
    const className = subjectClassSelect.value;
    if (!className) { alert('Please select a class'); return; }

    // read the 20 manual inputs (already in DOM; class = subject-input)
    const inputs = document.querySelectorAll('.subject-input');
    const subjects = [];
    inputs.forEach(input => {
      if (input && input.value && input.value.trim() !== '') subjects.push(input.value.trim());
    });

    if (subjects.length === 0) {
      alert('Please enter at least one subject');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: className, subjects })
      });
      const result = await res.json();
      if (result.success) {
        alert('Subjects saved!');
        subjectForm.reset();
        loadRegisteredSubjects();
      } else {
        alert(result.message || 'Failed to save subjects');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server.');
    }
  });

  window.deleteSubjects = async function(className) {
    if (!confirm(`Delete all subjects for ${className}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/subjects/${encodeURIComponent(className)}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        alert('Subjects deleted!');
        loadRegisteredSubjects();
      } else {
        alert(result.message || 'Failed to delete subjects');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server.');
    }
  };

  async function loadRegisteredSubjects() {
    if (!registeredSubjectsContainer) return;
    registeredSubjectsContainer.innerHTML = '<p>Loading...</p>';
    try {
      const res = await fetch(`${API_URL}/api/subjects`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      registeredSubjectsContainer.innerHTML = '';
      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-4 border rounded mb-4';
        div.innerHTML = `
          <h3 class="text-lg font-bold">${escapeHtml(item.class || '')}</h3>
          <ul class="list-disc ml-4 mt-2">
            ${((item.subjects || []).map(s => `<li>${escapeHtml(s)}</li>`)).join('')}
          </ul>
          <button class="delete-btn mt-3 px-3 py-1 text-white rounded"
          onclick="deleteSubjects('${encodeURIComponent(item.class)}')">
            Delete
          </button>
        `;
        registeredSubjectsContainer.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      registeredSubjectsContainer.innerHTML = '<p>Failed to load registered subjects.</p>';
    }
  }

  // Load initially
  loadRegisteredSubjects();
}

/* -------------------------
   RESULTS SECTION
   ------------------------- */
function setupResultsSection() {
  const resultForm = document.getElementById('resultForm');
  const resultClassSelect = document.getElementById('resultClass');
  const resultStudentSelect = document.getElementById('resultStudent');
  const resultSubjectContainer = document.getElementById('resultSubjects');

  if (!resultForm || !resultClassSelect || !resultStudentSelect) return;

  // load students when class changes
  resultClassSelect.addEventListener('change', () => {
    const selected = resultClassSelect.value;
    resultStudentSelect.innerHTML = `<option value="">--Select Student--</option>`;

    const filtered = (allStudents || []).filter(
      s => (s.studentClass || '').toLowerCase() === selected.toLowerCase()
    );

    filtered.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.studentId;
      opt.textContent = `${s.fullName} (${s.studentId})`;
      resultStudentSelect.appendChild(opt);
    });
  });

  // fetch subjects once student is picked
  resultStudentSelect.addEventListener('change', async () => {
    const className = resultClassSelect.value;
    resultSubjectContainer.innerHTML = 'Loading...';
    try {
      const res = await fetch(`${API_URL}/api/subjects/${encodeURIComponent(className)}`);
      const data = await res.json();
      const subjects = data.subjects || [];

      resultSubjectContainer.innerHTML = '';
      subjects.forEach(sub => {
        const row = document.createElement('div');
        row.className = 'mb-2';
        row.innerHTML = `
          <label>${escapeHtml(sub)}
            <input type="number" class="result-mark" data-subject="${escapeHtml(sub)}" placeholder="Score" />
          </label>
        `;
        resultSubjectContainer.appendChild(row);
      });
    } catch (err) {
      console.error(err);
      resultSubjectContainer.innerHTML = '<p>Failed to load subjects.</p>';
    }
  });

  // submit results
  resultForm.addEventListener('submit', async e => {
    e.preventDefault();
    const studentId = resultStudentSelect.value;
    const className = resultClassSelect.value;
    if (!studentId) return alert('Select student');
    if (!className) return alert('Select class');

    const marks = {};
    document.querySelectorAll('.result-mark').forEach(inp => {
      const subject = inp.dataset.subject;
      const score = inp.value ? Number(inp.value) : null;
      marks[subject] = score;
    });

    try {
      const res = await fetch(`${API_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, className, marks })
      });
      const data = await res.json();
      if (data.success) {
        alert('Results saved!');
        resultForm.reset();
        resultSubjectContainer.innerHTML = '';
      } else {
        alert(data.message || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server.');
    }
  });
}

/* -------------------------
   RESULTS DROPDOWNS (GLOBAL)
   ------------------------- */
function populateResultDropdowns() {
  const classSelect = document.getElementById('resultClass');
  const studentSelect = document.getElementById('resultStudent');

  if (!classSelect || !studentSelect) return;

  // class dropdown stays static (already in frontend)
  studentSelect.innerHTML = `<option value="">--Select Student--</option>`;

  (allStudents || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.studentId;
    opt.textContent = `${s.fullName} (${s.studentClass})`;
    studentSelect.appendChild(opt);
  });
}

/* -------------------------
   REGISTRATION FORM
   ------------------------- */
function setupRegistrationForm() {
  const studentForm = document.getElementById('registerStudentForm');
  const teacherForm = document.getElementById('registerTeacherForm');

  if (studentForm) {
    studentForm.addEventListener('submit', async e => {
      e.preventDefault();

      const payload = {
        fullName: studentForm.fullName.value,
        sex: studentForm.sex.value,
        dateOfBirth: studentForm.dateOfBirth.value,
        nationality: studentForm.nationality.value,
        stateOfOrigin: studentForm.stateOfOrigin.value,
        lga: studentForm.lga.value,
        studentAddress: studentForm.studentAddress.value,
        parentName: studentForm.parentName.value,
        parentPhone: studentForm.parentPhone.value,
        parentEmail: studentForm.parentEmail.value,
        guardianName: studentForm.guardianName.value,
        guardianPhone: studentForm.guardianPhone.value,
        guardianEmail: studentForm.guardianEmail.value,
        studentClass: studentForm.studentClass.value,
        admissionClass: studentForm.admissionClass.value
      };

      try {
        const res = await fetch(`${API_URL}/api/admin/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('Student registered!');
          studentForm.reset();
          fetchStudents();
        } else {
          alert(data.message || 'Failed to register student.');
        }
      } catch (err) {
        console.error(err);
        alert('Server connection failed.');
      }
    });
  }

  if (teacherForm) {
    teacherForm.addEventListener('submit', async e => {
      e.preventDefault();

      const payload = {
        fullName: teacherForm.fullName.value,
        phone: teacherForm.phone.value,
        email: teacherForm.email.value,
        qualification: teacherForm.qualification.value,
        subjectSpecialization: teacherForm.subjectSpecialization.value,
        classTeacher: teacherForm.classTeacher.value,
        yearsOfExperience: teacherForm.yearsOfExperience.value,
        joiningDate: teacherForm.joiningDate.value
      };

      try {
        const res = await fetch(`${API_URL}/api/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('Teacher registered!');
          teacherForm.reset();
          fetchTeachers();
        } else {
          alert(data.message || 'Failed to register teacher.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
      }
    });
  }
}

/* -------------------------
   HELPERS
   ------------------------- */
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m];
  });
}