import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
    const [activeSection, setActiveSection] = useState('students');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [studentName, setStudentName] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [courseStudents, setCourseStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);

    // Initialize system data on component mount
    useEffect(() => {
        initializeSystem();
        loadInitialData();
    }, []);

    // Load course students when course selection changes
    useEffect(() => {
        if (selectedCourse) {
            const studentsInCourse = users.filter(user => 
                user.role === 'student' && 
                user.courses && 
                user.courses.includes(selectedCourse)
            );
            setCourseStudents(studentsInCourse);
        } else {
            setCourseStudents([]);
        }
    }, [selectedCourse, users]);

    const initializeSystem = () => {
        // Initialize users if not exists
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
                { username: 'teacher1', password: 'teacher123', role: 'teacher', name: 'Ali Ahmed', courses: ['CS101'] },
                { username: 'student1', password: 'student123', role: 'student', name: 'Student One', rollNo: '001', courses: ['CS101', 'MATH201'] },
                { username: 'student2', password: 'student123', role: 'student', name: 'Student Two', rollNo: '002', courses: ['CS101', 'PHY101'] },
                { username: 'student3', password: 'student123', role: 'student', name: 'Student Three', rollNo: '003', courses: ['MATH201', 'PHY101'] }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Initialize courses if not exists
        if (!localStorage.getItem('courses')) {
            const defaultCourses = [
                { code: 'CS101', name: 'Introduction to Programming' },
                { code: 'MATH201', name: 'Calculus I' },
                { code: 'PHY101', name: 'Physics Fundamentals' }
            ];
            localStorage.setItem('courses', JSON.stringify(defaultCourses));
        }

        // Initialize attendance if not exists
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify([]));
        }
    };

    const loadInitialData = () => {
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const storedCourses = JSON.parse(localStorage.getItem('courses')) || [];
        const storedAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        
        setUsers(storedUsers);
        setCourses(storedCourses);
        setAttendance(storedAttendance);
    };

    const showSection = (section) => {
        setActiveSection(section);
    };

    // Student Management Functions
    const addStudent = () => {
        if (!studentName || !studentRollNo) {
            alert('Please fill all fields');
            return;
        }

        // Check if roll number already exists
        const existingStudent = users.find(u => u.rollNo === studentRollNo);
        if (existingStudent) {
            alert('Student with this roll number already exists!');
            return;
        }

        const newStudent = {
            username: `student${studentRollNo}`,
            password: 'student123',
            role: 'student',
            name: studentName,
            rollNo: studentRollNo,
            courses: []
        };

        const updatedUsers = [...users, newStudent];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        setStudentName('');
        setStudentRollNo('');
        
        alert(`Student added successfully!\nUsername: ${newStudent.username}\nPassword: ${newStudent.password}`);
    };

    const removeStudent = (username) => {
        if (confirm('Are you sure you want to remove this student?')) {
            const filteredUsers = users.filter(u => u.username !== username);
            setUsers(filteredUsers);
            localStorage.setItem('users', JSON.stringify(filteredUsers));
        }
    };

    // Course Management Functions
    const addCourse = () => {
        if (!courseCode || !courseName) {
            alert('Please fill all fields');
            return;
        }

        // Check if course code already exists
        const existingCourse = courses.find(c => c.code === courseCode);
        if (existingCourse) {
            alert('Course with this code already exists!');
            return;
        }

        const newCourse = { code: courseCode, name: courseName };
        const updatedCourses = [...courses, newCourse];
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));

        setCourseCode('');
        setCourseName('');
        
        alert(`Course ${courseName} added successfully!`);
    };

    const removeCourse = (code) => {
        if (confirm('Are you sure you want to remove this course?')) {
            const filteredCourses = courses.filter(c => c.code !== code);
            setCourses(filteredCourses);
            localStorage.setItem('courses', JSON.stringify(filteredCourses));
            
            // Remove this course from all students
            const updatedUsers = users.map(user => {
                if (user.courses && user.courses.includes(code)) {
                    return {
                        ...user,
                        courses: user.courses.filter(course => course !== code)
                    };
                }
                return user;
            });
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            alert('Course removed successfully!');
        }
    };

    // Course-Student Management Functions
    const addStudentToCourse = () => {
        if (!selectedCourse || !selectedStudent) {
            alert('Please select both course and student');
            return;
        }

        const student = users.find(u => u.username === selectedStudent);
        
        if (!student) {
            alert('Student not found');
            return;
        }

        // Initialize courses array if it doesn't exist
        if (!student.courses) {
            student.courses = [];
        }

        // Check if student is already in the course
        if (student.courses.includes(selectedCourse)) {
            alert('Student is already enrolled in this course');
            return;
        }

        // Add course to student
        student.courses.push(selectedCourse);
        const updatedUsers = users.map(u => u.username === selectedStudent ? student : u);
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Clear student selection
        setSelectedStudent('');
        
        alert(`Student ${student.name} added to course successfully!`);
    };

    const removeStudentFromCourse = (studentUsername, courseCode) => {
        if (confirm('Are you sure you want to remove this student from the course?')) {
            const student = users.find(u => u.username === studentUsername);
            
            if (student && student.courses) {
                student.courses = student.courses.filter(course => course !== courseCode);
                const updatedUsers = users.map(u => u.username === studentUsername ? student : u);
                setUsers(updatedUsers);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                alert('Student removed from course successfully!');
            }
        }
    };

    // Utility Functions
    const logout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
    };

    const getCourseName = (courseCode) => {
        const course = courses.find(c => c.code === courseCode);
        return course ? course.name : courseCode;
    };

    const getStudentName = (username) => {
        const student = users.find(u => u.username === username);
        return student ? student.name : username;
    };

    // Filter data for display
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    
    const filteredAttendance = attendance.filter(record => {
        if (!record) return false;
        const student = users.find(u => u.username === record.studentId);
        const course = courses.find(c => c.code === record.courseId);
        return student && course;
    });

    return (
        <div className="admin-dashboard">
            <div className="dashboard-container">
                <div className="header">
                    <h1>Admin Dashboard</h1>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
                
                <div className="nav-menu">
                    <button 
                        onClick={() => showSection('students')} 
                        className={activeSection === 'students' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Manage Students
                    </button>
                    <button 
                        onClick={() => showSection('courses')} 
                        className={activeSection === 'courses' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Manage Courses
                    </button>
                    <button 
                        onClick={() => showSection('course-students')} 
                        className={activeSection === 'course-students' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Course Students
                    </button>
                    <button 
                        onClick={() => showSection('reports')} 
                        className={activeSection === 'reports' ? 'nav-btn active' : 'nav-btn'}
                    >
                        View Reports
                    </button>
                </div>

                <div className="content">
                    {/* Students Section */}
                    {activeSection === 'students' && (
                        <div className="section">
                            <h2>Manage Students</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Student Name"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Roll Number"
                                        value={studentRollNo}
                                        onChange={(e) => setStudentRollNo(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <button className="btn success" onClick={addStudent}>Add Student</button>
                                </div>
                            </div>
                            
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Roll No</th>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Password</th>
                                            <th>Courses</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="no-data">No students found</td>
                                            </tr>
                                        ) : (
                                            students.map(student => {
                                                const studentCourses = student.courses || [];
                                                const courseNames = studentCourses.map(courseCode => 
                                                    getCourseName(courseCode)
                                                ).join(', ');
                                                
                                                return (
                                                    <tr key={student.username}>
                                                        <td>{student.rollNo}</td>
                                                        <td>{student.name}</td>
                                                        <td>{student.username}</td>
                                                        <td>{student.password}</td>
                                                        <td>{courseNames || 'No courses assigned'}</td>
                                                        <td>
                                                            <button 
                                                                className="btn danger"
                                                                onClick={() => removeStudent(student.username)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Courses Section */}
                    {activeSection === 'courses' && (
                        <div className="section">
                            <h2>Manage Courses</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Course Code"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Course Name"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <button className="btn success" onClick={addCourse}>Add Course</button>
                                </div>
                            </div>
                            
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Course Code</th>
                                            <th>Course Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="no-data">No courses found</td>
                                            </tr>
                                        ) : (
                                            courses.map(course => (
                                                <tr key={course.code}>
                                                    <td>{course.code}</td>
                                                    <td>{course.name}</td>
                                                    <td>
                                                        <button 
                                                            className="btn danger"
                                                            onClick={() => removeCourse(course.code)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Course Students Section */}
                    {activeSection === 'course-students' && (
                        <div className="section">
                            <h2>Manage Course Students</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Course:</label>
                                    <select 
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        <option value="">-- Select Course --</option>
                                        {courses.map(course => (
                                            <option key={course.code} value={course.code}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Select Student:</label>
                                    <select 
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                    >
                                        <option value="">-- Select Student --</option>
                                        {students.map(student => (
                                            <option key={student.username} value={student.username}>
                                                {student.name} ({student.rollNo})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <button className="btn success" onClick={addStudentToCourse}>
                                        Add Student to Course
                                    </button>
                                </div>
                            </div>

                            <h3>Students in Selected Course</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Roll No</th>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="no-data">
                                                    {selectedCourse ? 'No students enrolled in this course' : 'Please select a course'}
                                                </td>
                                            </tr>
                                        ) : (
                                            courseStudents.map(student => (
                                                <tr key={student.username}>
                                                    <td>{student.rollNo}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.username}</td>
                                                    <td>
                                                        <button 
                                                            className="btn danger"
                                                            onClick={() => removeStudentFromCourse(student.username, selectedCourse)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Reports Section */}
                    {activeSection === 'reports' && (
                        <div className="section">
                            <h2>Attendance Reports</h2>
                            
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-number">{filteredAttendance.length}</div>
                                    <div className="stat-label">Total Records</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{students.length}</div>
                                    <div className="stat-label">Total Students</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{courses.length}</div>
                                    <div className="stat-label">Total Courses</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{teachers.length}</div>
                                    <div className="stat-label">Total Teachers</div>
                                </div>
                            </div>
                            
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttendance.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="no-data">
                                                    No attendance records found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAttendance
                                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                                .map(record => {
                                                const student = users.find(u => u.username === record.studentId);
                                                const course = courses.find(c => c.code === record.courseId);
                                                const time = new Date(record.timestamp).toLocaleTimeString();
                                                
                                                return (
                                                    <tr key={record.id || record.timestamp}>
                                                        <td>{record.date}</td>
                                                        <td>{student ? student.name : record.studentId}</td>
                                                        <td>{course ? course.name : record.courseId}</td>
                                                        <td className={`status-${record.status}`}>
                                                            {record.status.toUpperCase()}
                                                        </td>
                                                        <td>{time}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;