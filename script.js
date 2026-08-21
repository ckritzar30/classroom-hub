
const courses = [
  { id: 1, title: "English Composition", section: "Section 01", teacher: "Ms. Rivera", progress: 72, color: "#2563eb", grade: "A-" },
  { id: 2, title: "College Algebra", section: "Section 03", teacher: "Mr. Chen", progress: 58, color: "#7c3aed", grade: "B+" },
  { id: 3, title: "Intro to Computing", section: "Section 02", teacher: "Dr. Brooks", progress: 84, color: "#059669", grade: "A" },
  { id: 4, title: "Environmental Science", section: "Section 04", teacher: "Mrs. Patel", progress: 66, color: "#d97706", grade: "B" }
];

const initialAssignments = [
  { id: 1, title: "Rhetorical Analysis Draft", course: "English Composition", due: "Today, 11:59 PM", done: false },
  { id: 2, title: "Linear Functions Quiz", course: "College Algebra", due: "Tomorrow, 9:00 AM", done: false },
  { id: 3, title: "HTML Profile Page", course: "Intro to Computing", due: "Friday, 11:59 PM", done: true }
];

const messages = [
  { subject: "Essay workshop reminder", sender: "Ms. Rivera", date: "August 21, 2026 at 9:15 AM", body: "Remember to bring your current rhetorical analysis draft to our next workshop. We will focus on thesis clarity, evidence, and organization." },
  { subject: "HTML assignment feedback", sender: "Dr. Brooks", date: "August 20, 2026", body: "Your profile page demonstrates a strong understanding of semantic HTML. Review the accessibility notes before starting the next assignment." },
  { subject: "Quiz study guide", sender: "Mr. Chen", date: "August 17, 2026", body: "The study guide for the linear functions quiz is now available. Focus on slope, intercepts, and interpreting graphs." }
];

let assignments = readAssignments();
let calendarDate = new Date(2026, 7, 1);
let toastTimer;

const pages = [...document.querySelectorAll(".page")];
const routeControls = [...document.querySelectorAll("[data-route]")];
const navItems = [...document.querySelectorAll(".nav-item")];
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("mobile-overlay");
const searchInput = document.getElementById("global-search");
const themeToggle = document.getElementById("theme-toggle");

function readAssignments() {
  try {
    const stored = JSON.parse(localStorage.getItem("classroomHubAssignments"));
    return Array.isArray(stored) ? stored : structuredClone(initialAssignments);
  } catch {
    return structuredClone(initialAssignments);
  }
}

function saveAssignments() {
  localStorage.setItem("classroomHubAssignments", JSON.stringify(assignments));
}

function courseCard(course, showButton = false) {
  return `
    <article class="course-card" style="--course-color:${course.color}">
      <div class="course-color"></div>
      <div class="course-content">
        <h3>${course.title}</h3>
        <p class="course-meta">${course.section}<br>${course.teacher}</p>
        <div class="progress-label"><span>Course progress</span><span>${course.progress}%</span></div>
        <div class="progress-track" aria-label="${course.progress} percent complete"><div class="progress-bar" style="width:${course.progress}%"></div></div>
        ${showButton ? `<button class="open-course" type="button" data-course="${course.id}">Open course</button>` : ""}
      </div>
    </article>`;
}

function renderCourses(query = "") {
  const normalized = query.trim().toLowerCase();
  const visible = courses.filter(course => `${course.title} ${course.teacher} ${course.section}`.toLowerCase().includes(normalized));
  document.getElementById("dashboard-course-grid").innerHTML = visible.slice(0, 4).map(course => courseCard(course)).join("");
  document.getElementById("all-course-grid").innerHTML = visible.map(course => courseCard(course, true)).join("");
  document.getElementById("course-empty").hidden = visible.length !== 0;
  document.querySelectorAll("[data-course]").forEach(button => button.addEventListener("click", () => {
    const course = courses.find(item => item.id === Number(button.dataset.course));
    showToast(`${course.title} selected. Course details are a demonstration.`);
  }));
}

function renderAssignments() {
  document.getElementById("dashboard-assignments").innerHTML = assignments.map(task => `
    <button class="assignment ${task.done ? "done" : ""}" type="button" data-task="${task.id}" aria-pressed="${task.done}">
      <span class="task-check" aria-hidden="true">✓</span>
      <div><strong>${task.title}</strong><small>${task.course}</small></div>
      <time>${task.due}</time>
    </button>`).join("");
  document.querySelectorAll("[data-task]").forEach(button => button.addEventListener("click", () => {
    const task = assignments.find(item => item.id === Number(button.dataset.task));
    task.done = !task.done;
    saveAssignments();
    renderAssignments();
    showToast(task.done ? "Assignment marked complete" : "Assignment marked incomplete");
  }));
}

function renderGrades() {
  document.getElementById("grade-grid").innerHTML = courses.map(course => `
    <article class="grade-card">
      <div><h2>${course.title}</h2><p>${course.section} · ${course.teacher}</p></div>
      <div class="grade-badge" aria-label="Grade ${course.grade}">${course.grade}</div>
    </article>`).join("");
}

function navigate(route) {
  const safeRoute = pages.some(page => page.dataset.page === route) ? route : "dashboard";
  pages.forEach(page => page.classList.toggle("active", page.dataset.page === safeRoute));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.route === safeRoute));
  document.title = `${safeRoute[0].toUpperCase()}${safeRoute.slice(1)} | Classroom Hub`;
  if (location.hash !== `#${safeRoute}`) history.replaceState(null, "", `#${safeRoute}`);
  closeSidebar();
  document.getElementById("main-content").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openSidebar() {
  sidebar.classList.add("open");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

function renderCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  document.getElementById("calendar-label").textContent = monthName;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    let day;
    let muted = false;
    let cellMonth = month;
    if (index < firstDay) { day = daysInPreviousMonth - firstDay + index + 1; muted = true; cellMonth = month - 1; }
    else if (index >= firstDay + daysInMonth) { day = index - firstDay - daysInMonth + 1; muted = true; cellMonth = month + 1; }
    else { day = index - firstDay + 1; }
    const isToday = year === 2026 && month === 7 && day === 21 && !muted;
    let event = "";
    if (!muted && year === 2026 && month === 7 && day === 21) event = '<span class="calendar-event">Analysis draft</span>';
    if (!muted && year === 2026 && month === 7 && day === 22) event = '<span class="calendar-event">Algebra quiz</span>';
    const dateLabel = new Date(year, cellMonth, day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    cells.push(`<div class="calendar-day ${muted ? "muted" : ""} ${isToday ? "today" : ""}" aria-label="${dateLabel}"><span>${day}</span>${event}</div>`);
  }
  document.getElementById("calendar-grid").innerHTML = cells.join("");
}

function showMessage(index) {
  const message = messages[index];
  document.querySelectorAll("[data-message]").forEach(button => button.classList.toggle("active", Number(button.dataset.message) === index));
  document.getElementById("message-reader").innerHTML = `<h2>${message.subject}</h2><p class="sender">From ${message.sender}<br>${message.date}</p><p class="message-body">${message.body}</p>`;
}

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  themeToggle.checked = dark;
  localStorage.setItem("classroomHubTheme", dark ? "dark" : "light");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

routeControls.forEach(control => control.addEventListener("click", event => {
  event.preventDefault();
  navigate(control.dataset.route);
}));
document.getElementById("menu-button").addEventListener("click", openSidebar);
document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);
searchInput.addEventListener("input", event => {
  renderCourses(event.target.value);
  if (event.target.value.trim()) navigate("courses");
});
document.getElementById("previous-month").addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
document.getElementById("next-month").addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });
document.querySelectorAll("[data-message]").forEach(button => button.addEventListener("click", () => showMessage(Number(button.dataset.message))));
themeToggle.addEventListener("change", () => applyTheme(themeToggle.checked ? "dark" : "light"));
document.getElementById("reset-data").addEventListener("click", () => {
  assignments = structuredClone(initialAssignments);
  localStorage.removeItem("classroomHubAssignments");
  localStorage.removeItem("classroomHubTheme");
  applyTheme("light");
  renderAssignments();
  showToast("Demonstration data reset");
});
window.addEventListener("hashchange", () => navigate(location.hash.slice(1) || "dashboard"));
window.addEventListener("keydown", event => { if (event.key === "Escape") closeSidebar(); });

renderCourses();
renderAssignments();
renderGrades();
renderCalendar();
showMessage(0);
applyTheme(localStorage.getItem("classroomHubTheme") || "light");
navigate(location.hash.slice(1) || "dashboard");
