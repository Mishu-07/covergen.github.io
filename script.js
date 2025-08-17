// This wrapper ensures the script runs only after the entire page is loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const elements = {
        passwordModal: document.getElementById('password-modal'),
        passwordInput: document.getElementById('password-input'),
        passwordSubmit: document.getElementById('password-submit'),
        modalContent: document.querySelector('.modal-content'),
        mainContent: document.getElementById('main-content'),
        generatePdfBtn: document.getElementById('generate-pdf'),
        generateJpgBtn: document.getElementById('generate-jpg'),
        courseCodeInput: document.getElementById('course-code'),
        studentNameInput: document.getElementById('student-name'),
        studentIdInput: document.getElementById('student-id'),
        expNoInput: document.getElementById('exp-no'),
        submittedToInput: document.getElementById('submitted-to'),
        courseNameInput: document.getElementById('course-name'),
        sectionInput: document.getElementById('section'),
        semesterInput: document.getElementById('semester'),
        submissionDateInput: document.getElementById('submission-date'),
        courseCodeOutput: document.getElementById('output-course-code'),
        studentNameOutput: document.getElementById('output-student-name'),
        studentIdOutput: document.getElementById('output-student-id'),
        expNoOutput: document.getElementById('output-exp-no'),
        submittedToOutput: document.getElementById('output-submitted-to'),
        courseNameOutput: document.getElementById('output-course-name'),
        sectionOutput: document.getElementById('output-section'),
        semesterOutput: document.getElementById('output-semester'),
        submissionDateOutput: document.getElementById('output-submission-date'),
        coverPage: document.getElementById('cover-page')
    };

    // --- Default Data for Initial Load ---
    const defaultData = {
        courseCode: "CHE203L",
        studentName: "Sadia Islam",
        studentId: "2322979647",
        expNo: "4",
        submittedTo: "Md Istiak Hossain (MIO)",
        courseName: "Chemistry of Biomolecules Lab",
        section: "4",
        semester: "Summer 25",
        submissionDate: "2025-08-17"
    };

    // --- Core Functions ---

    // Updates the live preview panel based on form input
    const updatePreview = () => {
        const getVal = (el, def) => el.value || def;
        elements.courseCodeOutput.textContent = getVal(elements.courseCodeInput, defaultData.courseCode) + " REPORT";
        elements.studentNameOutput.textContent = getVal(elements.studentNameInput, defaultData.studentName);
        elements.studentIdOutput.textContent = getVal(elements.studentIdInput, defaultData.studentId);
        elements.expNoOutput.textContent = getVal(elements.expNoInput, defaultData.expNo);
        elements.submittedToOutput.textContent = getVal(elements.submittedToInput, defaultData.submittedTo);
        elements.courseNameOutput.textContent = getVal(elements.courseNameInput, defaultData.courseName);
        elements.sectionOutput.textContent = getVal(elements.sectionInput, defaultData.section);
        elements.semesterOutput.textContent = getVal(elements.semesterInput, defaultData.semester);
        
        const dateValue = elements.submissionDateInput.value;
        if (dateValue) {
            const date = new Date(dateValue);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const correctedDate = new Date(date.getTime() + userTimezoneOffset);
            elements.submissionDateOutput.textContent = correctedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        } else {
            const defaultDateObj = new Date(defaultData.submissionDate);
            const correctedDefaultDate = new Date(defaultDateObj.getTime() + defaultDateObj.getTimezoneOffset() * 60000);
            elements.submissionDateOutput.textContent = correctedDefaultDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        }
    };
    
    // Converts an image URL to a Base64 data URL for embedding
    const getImageDataUrl = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    // Saves the current form data to localStorage
    const saveData = () => {
        const currentData = {
            courseCode: elements.courseCodeInput.value,
            studentName: elements.studentNameInput.value,
            studentId: elements.studentIdInput.value,
            expNo: elements.expNoInput.value,
            submittedTo: elements.submittedToInput.value,
            courseName: elements.courseNameInput.value,
            section: elements.sectionInput.value,
            semester: elements.semesterInput.value,
            submissionDate: elements.submissionDateInput.value,
        };
        localStorage.setItem('coverPageData', JSON.stringify(currentData));
    };

    // Loads data from localStorage or uses defaults
    const loadData = () => {
        const savedData = localStorage.getItem('coverPageData');
        const data = savedData ? JSON.parse(savedData) : defaultData;
        elements.courseCodeInput.value = data.courseCode;
        elements.studentNameInput.value = data.studentName;
        elements.studentIdInput.value = data.studentId;
        elements.expNoInput.value = data.expNo;
        elements.submittedToInput.value = data.submittedTo;
        elements.courseNameInput.value = data.courseName;
        elements.sectionInput.value = data.section;
        elements.semesterInput.value = data.semester;
        elements.submissionDateInput.value = data.submissionDate;
        updatePreview();
    };

    // --- Main Application Initialization ---
    const initializeApp = () => {
        window.jsPDF = window.jspdf.jsPDF;
        loadData();
        
        const inputs = document.querySelectorAll('.form-body input');
        inputs.forEach(input => {
            input.addEventListener('keyup', updatePreview);
            input.addEventListener('change', updatePreview);
        });

        // Event Listener for PDF Generation
        elements.generatePdfBtn.addEventListener('click', async () => {
            updatePreview(); 
            saveData();
            
            const logoDataUrl = await getImageDataUrl('logo.png');
            const img = new Image();
            img.src = logoDataUrl;
            await new Promise(resolve => img.onload = resolve);
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const addCenteredBoldNormalText = (boldText, normalText, y) => {
                const fontSize = pdf.getFontSize();
                pdf.setFont('times', 'bold');
                const boldWidth = pdf.getStringUnitWidth(boldText) * fontSize / pdf.internal.scaleFactor;
                pdf.setFont('times', 'normal');
                const normalWidth = pdf.getStringUnitWidth(normalText) * fontSize / pdf.internal.scaleFactor;
                const totalWidth = boldWidth + normalWidth;
                const startX = (pageWidth / 2) - (totalWidth / 2);
                pdf.setFont('times', 'bold');
                pdf.text(boldText, startX, y);
                pdf.setFont('times', 'normal');
                pdf.text(normalText, startX + boldWidth, y);
            };

            pdf.setFont('times', 'bold');
            pdf.setFontSize(20);
            pdf.text(elements.courseCodeOutput.textContent, pageWidth / 2, 30, { align: 'center' });
            
            const logoWidth = 50;
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            const logoHeight = logoWidth * aspectRatio;
            const logoX = (pageWidth - logoWidth) / 2;
            pdf.addImage(logoDataUrl, 'PNG', logoX, 40, logoWidth, logoHeight, undefined, 'FAST');
            
            pdf.setFontSize(14);
            // Increased the starting 'y' position to add space below the logo
            let y = 115; 
            const lineSpacing = 7;
            const blockSpacing = 18;

            addCenteredBoldNormalText('Submitted By: ', elements.studentNameInput.value, y); y += lineSpacing;
            addCenteredBoldNormalText('ID: ', elements.studentIdInput.value, y); y += blockSpacing;

            addCenteredBoldNormalText('Experiment No: ', elements.expNoInput.value, y); y += blockSpacing;

            addCenteredBoldNormalText('Submitted To: ', elements.submittedToInput.value, y); y += lineSpacing;
            addCenteredBoldNormalText('Course name: ', elements.courseNameInput.value, y); y += blockSpacing;

            addCenteredBoldNormalText('Section: ', elements.sectionInput.value, y); y += lineSpacing;
            addCenteredBoldNormalText('Semester: ', elements.semesterInput.value, y); y += blockSpacing;

            addCenteredBoldNormalText('Date of Submission: ', elements.submissionDateOutput.textContent, y);

            pdf.setFont('times', 'bold');
            pdf.setFontSize(14);
            const footerY = pageHeight - 40;
            pdf.text("Department of Biochemistry and Biotechnology", pageWidth / 2, footerY, { align: 'center' });
            pdf.text("North South University", pageWidth / 2, footerY + 8, { align: 'center' });
            
            const courseName = elements.courseNameInput.value || defaultData.courseName;
            const expNo = elements.expNoInput.value || defaultData.expNo;
            const fileName = `Cover - ${courseName} - Lab ${expNo}`;
            
            pdf.save(`${fileName}.pdf`);
        });

        // Event Listener for JPG Generation
        elements.generateJpgBtn.addEventListener('click', () => {
            updatePreview(); 
            saveData();
            html2canvas(elements.coverPage, { scale: 3, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                
                const courseName = elements.courseNameInput.value || defaultData.courseName;
                const expNo = elements.expNoInput.value || defaultData.expNo;
                const fileName = `Cover - ${courseName} - Lab ${expNo}`;
                
                link.download = `${fileName}.jpg`;
                link.click();
            });
        });
    };

    // --- Password Handling ---
    const handlePassword = () => {
        if (elements.passwordInput.value === 'sadia03') {
            elements.passwordModal.classList.add('modal-hidden');
            elements.mainContent.classList.remove('content-hidden');
            initializeApp();
        } else {
            elements.modalContent.classList.add('shake');
            setTimeout(() => elements.modalContent.classList.remove('shake'), 500);
        }
    };

    elements.passwordSubmit.addEventListener('click', handlePassword);
    elements.passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePassword();
    });
});
