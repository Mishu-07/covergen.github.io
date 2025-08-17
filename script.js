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
            img.crossOrigin = 'Anonymous'; // Important for local development with a server
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
        
        // Add event listeners to all inputs to update the preview in real-time
        const inputs = document.querySelectorAll('.form-body input');
        inputs.forEach(input => {
            input.addEventListener('keyup', updatePreview);
            input.addEventListener('change', updatePreview);
        });

        // Event Listener for PDF Generation
        elements.generatePdfBtn.addEventListener('click', async () => {
            updatePreview(); 
            saveData();
            
            // Convert the logo to a data URL and get its dimensions
            const logoDataUrl = await getImageDataUrl('logo.png');
            const img = new Image();
            img.src = logoDataUrl;
            await new Promise(resolve => img.onload = resolve); // Wait for image to load
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();

            // Add Course Code Title
            pdf.setFont('times', 'bold');
            pdf.setFontSize(20);
            pdf.text(elements.courseCodeOutput.textContent, pageWidth / 2, 40, { align: 'center' });
            
            // --- IMAGE PROPORTION & COMPRESSION FIX ---
            const logoWidth = 55; // Desired width of the logo in the PDF
            const aspectRatio = img.naturalHeight / img.naturalWidth; // Calculate original aspect ratio
            const logoHeight = logoWidth * aspectRatio; // Calculate proportional height
            const logoX = (pageWidth - logoWidth) / 2; // Center the logo horizontally

            // Add the logo with correct dimensions and compression
            pdf.addImage(logoDataUrl, 'PNG', logoX, 55, logoWidth, logoHeight, undefined, 'FAST');
            
            // Add the rest of the text details
            pdf.setFont('times', 'normal');
            pdf.setFontSize(14);
            let y = 120;
            const lineSpacing = 7;
            const blockSpacing = 14;
            pdf.text(`Submitted By: ${elements.studentNameInput.value}`, pageWidth / 2, y, { align: 'center' }); y += lineSpacing;
            pdf.text(`ID: ${elements.studentIdInput.value}`, pageWidth / 2, y, { align: 'center' }); y += blockSpacing;
            pdf.text(`Experiment No: ${elements.expNoInput.value}`, pageWidth / 2, y, { align: 'center' }); y += blockSpacing;
            pdf.text(`Submitted To: ${elements.submittedToInput.value}`, pageWidth / 2, y, { align: 'center' }); y += lineSpacing;
            pdf.text(`Course name: ${elements.courseNameInput.value}`, pageWidth / 2, y, { align: 'center' }); y += blockSpacing;
            pdf.text(`Section: ${elements.sectionInput.value}`, pageWidth / 2, y, { align: 'center' }); y += lineSpacing;
            pdf.text(`Semester: ${elements.semesterInput.value}`, pageWidth / 2, y, { align: 'center' }); y += blockSpacing;
            pdf.text(`Date of Submission: ${elements.submissionDateOutput.textContent}`, pageWidth / 2, y, { align: 'center' });
            
            // Add Footer
            pdf.setFont('times', 'bold');
            pdf.setFontSize(14);
            pdf.text("Department of Biochemistry and Biotechnology", pageWidth / 2, 250, { align: 'center' });
            pdf.setFontSize(20);
            pdf.text("North South University", pageWidth / 2, 260, { align: 'center' });
            
            // --- DYNAMIC FILENAME ---
            const courseName = elements.courseNameInput.value || defaultData.courseName;
            const expNo = elements.expNoInput.value || defaultData.expNo;
            const fileName = `Cover - ${courseName} - Lab ${expNo}`;
            
            // Save the PDF
            pdf.save(`${fileName}.pdf`);
        });

        // Event Listener for JPG Generation
        elements.generateJpgBtn.addEventListener('click', () => {
            updatePreview(); 
            saveData();
            html2canvas(elements.coverPage, { scale: 3, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                
                // --- DYNAMIC FILENAME ---
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
