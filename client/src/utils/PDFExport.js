import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export Students Report
export const exportStudentsPDF = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/export-data?type=students');
        const data = await response.json();

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(236, 72, 153); // Primary color
        doc.text('HerCycle Platform', 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Student Progress Report', 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);

        // Table
        const tableData = data.students.map(s => [
            s.name,
            s.email,
            `${s.completedCourses}/${s.totalCourses}`,
            `${s.progress}%`,
            new Date(s.joinedDate).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Name', 'Email', 'Courses', 'Progress', 'Joined']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [236, 72, 153],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 4
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`hercycle-students-${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error exporting students PDF:', error);
        return false;
    }
};

// Export Courses Report
export const exportCoursesPDF = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/export-data?type=courses');
        const data = await response.json();

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(236, 72, 153);
        doc.text('HerCycle Platform', 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Courses Report', 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
        doc.text(`Total Courses: ${data.courses.length}`, 14, 44);

        // Table
        const tableData = data.courses.map(c => [
            c.title,
            c.instructor,
            c.creator,
            c.topic,
            `${c.lessonsCount} lessons`,
            new Date(c.createdAt).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Title', 'Instructor', 'Creator', 'Topic', 'Content', 'Created']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [236, 72, 153],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 35 },
                2: { cellWidth: 30 }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`hercycle-courses-${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error exporting courses PDF:', error);
        return false;
    }
};

// Export Modifications Report
export const exportModificationsPDF = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/export-data?type=modifications');
        const data = await response.json();

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(236, 72, 153);
        doc.text('HerCycle Platform', 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Modification Audit Report', 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
        doc.text(`Total Modifications: ${data.modifications.length}`, 14, 44);

        // Table
        const tableData = data.modifications.map(m => [
            m.courseTitle,
            m.action.toUpperCase(),
            m.modifiedBy,
            m.originalCreator || 'N/A',
            m.reason.substring(0, 50) + (m.reason.length > 50 ? '...' : ''),
            new Date(m.date).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Course', 'Action', 'Modified By', 'Creator', 'Reason', 'Date']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [236, 72, 153],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 7,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 35 },
                4: { cellWidth: 50 }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`hercycle-modifications-${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error exporting modifications PDF:', error);
        return false;
    }
};

// Export Full History Report
export const exportFullHistoryPDF = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/export-data?type=full');
        const data = await response.json();

        const doc = new jsPDF();

        // Cover Page
        doc.setFontSize(24);
        doc.setTextColor(236, 72, 153);
        doc.text('HerCycle Platform', 105, 60, { align: 'center' });

        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('Comprehensive Platform Report', 105, 80, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 100, { align: 'center' });

        // Summary
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 105, 130, { align: 'center' });

        doc.setFontSize(11);
        const summary = [
            `Total Students: ${data.students.length}`,
            `Total Courses: ${data.courses.length}`,
            `Total Modifications: ${data.modifications.length}`,
            `Deleted Students: ${data.studentDeletions?.length || 0}`
        ];

        let yPos = 145;
        summary.forEach(line => {
            doc.text(line, 105, yPos, { align: 'center' });
            yPos += 8;
        });

        // Students Section
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(236, 72, 153);
        doc.text('Students', 14, 20);

        const studentData = data.students.map(s => [
            s.name,
            s.email,
            `${s.progress}%`
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['Name', 'Email', 'Progress']],
            body: studentData,
            theme: 'grid',
            headStyles: { fillColor: [236, 72, 153] }
        });

        // Courses Section
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(236, 72, 153);
        doc.text('Courses', 14, 20);

        const courseData = data.courses.map(c => [
            c.title,
            c.instructor,
            c.topic
        ]);

        autoTable(doc, {
            startY: 30,
            head: [['Title', 'Instructor', 'Topic']],
            body: courseData,
            theme: 'grid',
            headStyles: { fillColor: [236, 72, 153] }
        });

        // Modifications Section
        if (data.modifications.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(236, 72, 153);
            doc.text('Recent Modifications', 14, 20);

            const modData = data.modifications.slice(0, 20).map(m => [
                m.courseTitle,
                m.action.toUpperCase(),
                m.modifiedBy,
                new Date(m.date).toLocaleDateString()
            ]);

            autoTable(doc, {
                startY: 30,
                head: [['Course', 'Action', 'Modified By', 'Date']],
                body: modData,
                theme: 'grid',
                headStyles: { fillColor: [236, 72, 153] }
            });
        }

        // Deleted Students Section
        if (data.studentDeletions && data.studentDeletions.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(236, 72, 153);
            doc.text('Deleted Students', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Total Deleted: ${data.studentDeletions.length}`, 14, 28);

            const deletionData = data.studentDeletions.map(d => [
                d.studentName,
                d.studentEmail,
                d.deletedBy,
                d.reason.substring(0, 40) + (d.reason.length > 40 ? '...' : ''),
                new Date(d.date).toLocaleDateString()
            ]);

            autoTable(doc, {
                startY: 35,
                head: [['Student Name', 'Email', 'Deleted By', 'Reason', 'Date']],
                body: deletionData,
                theme: 'grid',
                headStyles: { fillColor: [236, 72, 153] },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                columnStyles: {
                    1: { cellWidth: 45 },
                    3: { cellWidth: 45 }
                }
            });
        }

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`hercycle-full-report-${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error exporting full history PDF:', error);
        return false;
    }
};
