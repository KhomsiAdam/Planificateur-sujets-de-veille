// =============== //
// Modules imports //
// =============== //

// Detection Module
// import { elementInView, getElementsInView } from "./modules/detection.js";

// ========= //
// Variables //
// ========= //

// List of students
let students = [];

// List of uploaded students
let uploaded_students = [];

// First student in uploaded list
let student_index = 0;

// Ordered final list of student
let ordered_students = [];

// Starting date
let starting_date;
// Ending date
let ending_date;

// Days planned depending on number of students
let planned_days = [];

// Random picked student
let random_student;

// Total number of students
let number_of_students;

// false: students informations was entered manually, true: students list was uploaded
let file_uploaded = false;

// If an entry already exists in the students array
let entry_exists = false;

// For validation of entries in the imported csv file
let valid_entries = true;

// For duplicate entries in the imported csv file
let duplicate_entry = false;

// Student name and subject inputs
const nom = document.getElementById('nom');
const prenom = document.getElementById('prenom');
const sujet = document.getElementById('sujet');

// ========= //
// Functions //
// ========= //

// Regular expression for inputs
function regexInputs(value) {
    return value.match(/[^\w\s(\-).]/gi, "") ? false : true;
}
// Regular expression for csv file
function regexCsv(value) {
    return value.match(/[^\w\s(\-).,]/gi, "") ? false : true;
}

// Handling csv file upload
function handleFiles(file) {
    // Check for the File API support.
    if (window.FileReader) {
        getAsText(file[0]);
    } else {
        alert('FileReader is not supported in this browser.');
    }
}

// Read as text
function getAsText(fileToRead) {
    const reader = new FileReader();
    // Read file into memory as UTF-8      
    reader.readAsText(fileToRead);
    // Handle errors load
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
}

// Load & Error handler
function loadHandler(e) {
    const csv = e.target.result;
    processData(csv);
}
function errorHandler(e) {
    if (e.target.error.name == "NotReadableError") {
        alert("Cannot read file !");
    }
}

// Process the csv file
function processData(csv) {
    // Initialize the valid entries to true
    valid_entries = true;
    // Initialize the uploaded list of students array
    uploaded_students = [];
    // Split the lines as rows into array
    const student_rows = csv.split(/\r\n|\n/);
    for (let i = 0; i < student_rows.length; i++) {
        // Split each line to separate firstname and lastname
        let student_fullname = student_rows[i].split(',');
        let student_entry = [];
        // Push the separated fullname into an array
        for (let j = 0; j < student_fullname.length; j++) {
            // Check for valid names
            if (regexCsv(student_fullname[j])) {
                student_entry.push(student_fullname[j]);
            } else {
                // Set the valid entries to false
                valid_entries = false;
                document.querySelector('.custom-file-text').innerHTML = 'Des charactères non valides sont présent dans le fichier.';
                document.querySelector('.custom-file-text').classList.add('error');
                // Clear the file input, number of students an the uploaded list of students
                document.querySelector('.custom-file-input').value = '';
                number_of_students = '';
                document.querySelector('.student-number').innerHTML = number_of_students;
                uploaded_students = [];
                // Enable the names inputs
                nom.disabled = false;
                prenom.disabled = false;
                // Clear the name inputs
                nom.value = '';
                prenom.value = '';
                // Set the upload status to false
                file_uploaded = false;
            }
        }
        // Push the student entry with both firstname and lastname into the list of students uploaded from the file
        if (valid_entries == true) {
            // When the array is empty push the first entry
            if (uploaded_students.length === 0) {
                uploaded_students.push(student_entry);
            // Then verify each entry if it already exists, skip it
            } else {
                for (let i = 0; i < uploaded_students.length; i++) {
                    if (uploaded_students[i][0] == student_entry[0] && uploaded_students[i][1] == student_entry[1]) {
                        duplicate_entry = true;
                    } else {
                        duplicate_entry = false;
                    }
                }
                if (duplicate_entry == false) uploaded_students.push(student_entry);
            }
        }
    }
    if (valid_entries == true) {
        // Change the file upload to be true
        file_uploaded = true;
        // Set the number of students
        number_of_students = uploaded_students.length;
        // Show the total number of students
        document.querySelector('.student-number').innerHTML = number_of_students;
        // Disable the names inputs
        nom.disabled = true;
        prenom.disabled = true;
        // Change the names input values to the first student in the uploaded list
        nom.value = uploaded_students[student_index][0];
        prenom.value = uploaded_students[student_index][1];
    }
}

// Get the name of the day to ignore weekends
function getDayName(date) {
    const day_name = new Date(date).getDay();
    switch (day_name) {
        case 0:
            return 'Sunday'
        case 1:
            return 'Monday'
        case 2:
            return 'Tuesday'
        case 3:
            return 'Wednesday'
        case 4:
            return 'Thursday'
        case 5:
            return 'Friday'
        case 6:
            return 'Saturday'
    }
}

// Unfocus Form elements (inputs, buttons)
function unfocusFormElements() {
    Array.from(document.querySelectorAll('input')).forEach(element => element.blur());
    Array.from(document.querySelectorAll('button')).forEach(element => element.blur());
}

// Convert array into "csv" format
function arrayToCsv(data) {
    // csv file rows
    const csv_rows = [];
    // csv file headers
    const csv_headers = ["Ordre de passage", "Nom et prénom", "Sujet de veille", "Date de passage"];
    // Keys of the student object to get the values
    const obj_keys = ["order", "name", "subject", "date"];
    // Push the csv headers first
    csv_rows.push(csv_headers.join(','));
    // For each row of data map the values to the keys and escape some special characters
    for (const row of data) {
        const values = obj_keys.map(key => {
            const escaped = ('' + row[key]).replace(/"/g, '\\"');
            return `${escaped}`;
        });
        // Push the values joined by comma
        csv_rows.push(values.join(','));
    }
    return csv_rows.join('\n');

}
// Handle the download of the "csv" generated data in to a ".csv" file
function download(data) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('hidden', '');
    link.setAttribute('href', url);
    link.setAttribute('download', 'planning_sujets_' + starting_date + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Any code that needs to run after the document loads
document.addEventListener('DOMContentLoaded', () => {
    // Slider initialisation
    let slider_container = document.querySelector('.planner__slider');
    // Init the base translate value depending on how many slide in the slider
    let translate_init = 100 / slider_container.childElementCount;
    // Value for the next slide translate
    let translate_next = translate_init;
    // Value for the previous slide translate
    let translate_previous = -translate_init;
    // Max value beyond the last slide
    let translate_max = slider_container.childElementCount * translate_init;
    /* Slider functions */
    // Slide right
    function slideRight() {
        // Move to next slide when the translate value is less then max
        if (translate_next < translate_max) {
            slider_container.style.transform = 'translateX(-' + translate_next + '%)';
            // Store the value for the previous slide
            translate_previous = translate_next - translate_init;
            // Increment the value for the next slide by the base value
            translate_next += translate_init;
        }
    }
    // Slide left
    function slideLeft() {
        // Move to previous slide when the translate value is bigger or equal to zero
        if (translate_previous >= 0) {
            slider_container.style.transform = 'translateX(-' + translate_previous + '%)';
            // Store the value for the next slide
            translate_next = translate_previous + translate_init;
            // Decrement the value for the previous slide by the base value
            translate_previous -= translate_init;
            if (translate_previous < 0) translate_previous = 0;
        }
    }

    // // Touch slider init
    // let slider_touch_start_X = 0;
    // let slider_touch_end_X = 0;
    // // Get the initial value at start of the touch
    // slider_container.addEventListener('touchstart', e => {
    //     slider_touch_start_X = e.changedTouches[0].screenX;
    // })
    // // Get the end value after ending the touch and compare it to the start value
    // slider_container.addEventListener('touchend', e => {
    //     slider_touch_end_X = e.changedTouches[0].screenX;
    //     // Swipe left = Slide right
    //     if (slider_touch_end_X < slider_touch_start_X - 50) {
    //         slideRight();
    //         // Swipe right = Slide left
    //     } else if (slider_touch_end_X > slider_touch_start_X + 50) {
    //         slideLeft();
    //     }
    // })

    // Custom file input for uploading csv files of list of students
    const file_input = document.querySelector('.custom-file-input');
    const file_button = document.querySelector('.custom-file-button');
    const file_text = document.querySelector('.custom-file-text');
    // Custom file button click = real file input clicked
    file_button.addEventListener('click', (e) => {
        e.preventDefault();
        file_input.click();
    });
    // Check for input file value change
    file_input.addEventListener('change', (e) => {
        if (file_input.value) {
            // Get the file extention
            const file_name = file_input.value;
            const index_dot = file_name.lastIndexOf(".") + 1,
                file_ext = file_name.substr(index_dot, file_name.length).toLowerCase();
            // Only allow ".csv" files
            if (file_ext == 'csv') {
                // Show the filename in the custom input file text and handle the file
                file_text.innerHTML = file_input.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
                file_text.classList.remove('error');
                const file = e.target.files;
                handleFiles(file);
            } else {
                file_text.innerHTML = 'Seuls les fichiers csv sont autorisés';
                file_text.classList.add('error');
                // Clear the file input, number of students an the uploaded list of students
                file_input.value = '';
                number_of_students = '';
                document.querySelector('.student-number').innerHTML = number_of_students;
                uploaded_students = [];
                // Enable the names inputs
                nom.disabled = false;
                prenom.disabled = false;
                // Clear the name inputs
                nom.value = '';
                prenom.value = '';
                // Set the upload status to false
                file_uploaded = false;
            }
        } else {
            file_text.innerHTML = 'Aucun fichier choisi';
            file_text.classList.remove('error');
        }
    });

    // Confirming the upload of the list of students
    document.getElementById('file-confirm').addEventListener('click', (e) => {
        e.preventDefault();
        // When the students list is uploaded from a file
        if (file_uploaded == true) {
            // Unfocus all inputs and buttons
            unfocusFormElements();
            // Slide right then progress to step 2
            slideRight();
            document.querySelector('.planner__steps__progressbar').classList.add('step-2');
            document.getElementById('step-2').classList.add('active');
        }
    })

    // Manually setting the number of students
    const number = document.getElementById('number');
    document.getElementById('number-confirm').addEventListener('click', (e) => {
        e.preventDefault();
        if (number.value > 0 && number.value < 50) {
            // Clear the uploaded list of students
            uploaded_students = [];
            // Clear the file input
            file_input.value = '';
            file_text.innerHTML = 'Aucun fichier choisi';
            // Set the upload status to false
            file_uploaded = false;
            // Enable the names inputs
            nom.disabled = false;
            prenom.disabled = false;
            // Reset the students form and set the number of students
            document.getElementById('student-form').reset();
            number_of_students = number.value;
            document.querySelector('.student-number').innerHTML = number_of_students;
            // Clear the number of students input
            number.value = '';
            // Unfocus all inputs and buttons
            unfocusFormElements();
            // Slide right then progress to step 2
            slideRight();
            document.querySelector('.planner__steps__progressbar').classList.add('step-2');
            document.getElementById('step-2').classList.add('active');
        } else {
            document.getElementById('number-error').innerHTML = 'Veuillez choisir un nombre valide entre 1 et 50';
            number.classList.add('error');
        }
    })
    // Remove the error red outline and message when clicking on the input
    number.addEventListener('click', () => {
        number.classList.remove('error');
        document.getElementById('number-error').innerHTML = '';
    })

    // Submitting student names and subject
    document.querySelector('.submit').addEventListener('click', (e) => {
        e.preventDefault();
        entry_exists = false;
        // Check if inputs are not empty
        if (nom.value !== '' && prenom.value !== '' && sujet.value !== '') {
            document.getElementById('submit-error').innerHTML = '';
            // When the students informations is set manually
            if (file_uploaded == false) {
                // As long as there is still students left
                if (number_of_students > 0) {
                    // If there is entries in the students array
                    if (students.length > 0) {
                        // Check if a name or subject already exists
                        for (let i = 0; i < students.length; i++) {
                            if (nom.value + ' ' + prenom.value == students[i].name) {
                                document.getElementById('submit-error').innerHTML = 'Cet étudiant existe déjà.';
                                unfocusFormElements();
                                nom.classList.add('error');
                                prenom.classList.add('error');
                                entry_exists = true;
                            } else if (sujet.value == students[i].subject) {
                                document.getElementById('submit-error').innerHTML = 'Ce sujet a déjà été affecté.';
                                unfocusFormElements();
                                sujet.classList.add('error');
                                entry_exists = true;
                            }
                        }
                    }
                    if (entry_exists != true) {
                        // Check for special characters
                        if (regexInputs(nom.value) && regexInputs(prenom.value) && regexInputs(sujet.value)) {
                            // Setup a student object with firstname, lastname and subject
                            let student_obj = {
                                order: '',
                                name: nom.value + ' ' + prenom.value,
                                subject: sujet.value,
                                date: ''
                            }
                            // Push the student object entry in the students array
                            students.push(student_obj);
                            // Reset the form
                            document.getElementById('student-form').reset();
                            // Focus the lastname input
                            nom.focus();
                            // Decrement the number of student
                            number_of_students -= 1;
                            // Update the visualisation of the number of students
                            document.querySelector('.student-number').innerHTML = number_of_students;
                            // After submitting the last student
                            if (number_of_students == 0) {
                                // Unfocus all inputs and buttons
                                unfocusFormElements();
                                // Slide right then progress to step 3
                                slideRight();
                                document.querySelector('.planner__steps__progressbar').classList.add('step-3');
                                document.getElementById('step-3').classList.add('active');
                            }
                        } else {
                            unfocusFormElements();
                            if (!regexInputs(nom.value)) {
                                nom.classList.add('error');
                            }
                            if (!regexInputs(prenom.value)) {
                                prenom.classList.add('error');
                            }
                            if (!regexInputs(sujet.value)) {
                                sujet.classList.add('error');
                            }
                            document.getElementById('submit-error').innerHTML = 'Veuillez entrer des charactères valides.';
                        }
                    }
                }
                // When the students names are uploaded fom a csv file
            } else {
                // As long as the student index is lower than the uploaded students list length
                if (student_index < uploaded_students.length) {
                    // If there is entries in the students array
                    if (students.length > 0) {
                        // Check if a name or subject already exists
                        for (let i = 0; i < students.length; i++) {
                            if (sujet.value == students[i].subject) {
                                document.getElementById('submit-error').innerHTML = 'Ce sujet a déjà été affecté.';
                                unfocusFormElements();
                                sujet.classList.add('error');
                                entry_exists = true;
                            }
                        }
                    }
                    if (entry_exists != true) {
                        // Check for special characters
                        if (regexInputs(nom.value) && regexInputs(prenom.value) && regexInputs(sujet.value)) {

                            // Setup a student object with firstname, lastname and subject
                            let student_obj = {
                                order: '',
                                name: nom.value + ' ' + prenom.value,
                                subject: sujet.value,
                                date: ''
                            }
                            // Push the student object entry in the students array
                            students.push(student_obj);
                            // Decrement the number of student
                            number_of_students -= 1;
                            // Update the visualisation of the number of students
                            document.querySelector('.student-number').innerHTML = number_of_students;
                            // Focus the subject input and clear it
                            sujet.focus();
                            sujet.value = '';
                            // Increment the student index
                            student_index += 1;
                            // Put the name of the next student in the name inputs as long as the student index is lower than the uploaded students list length
                            if (student_index < uploaded_students.length) {
                                nom.value = uploaded_students[student_index][0];
                                prenom.value = uploaded_students[student_index][1];
                            }
                            // After submitting the last student
                            if (number_of_students == 0) {
                                // Unfocus all inputs and buttons
                                unfocusFormElements();
                                // Slide right then progress to step 3
                                slideRight();
                                document.querySelector('.planner__steps__progressbar').classList.add('step-3');
                                document.getElementById('step-3').classList.add('active');
                            }
                        } else {
                            unfocusFormElements();
                            if (!regexInputs(sujet.value)) {
                                sujet.classList.add('error');
                            }
                            document.getElementById('submit-error').innerHTML = 'Veuillez entrer des charactères valides.';
                        }
                    }
                }
            }
        } else {
            document.getElementById('submit-error').innerHTML = 'Veuillez remplir tout les champs.';
            if (nom.value == '') {
                nom.classList.add('error');
            }
            if (prenom.value == '') {
                prenom.classList.add('error');
            }
            if (sujet.value == '') {
                sujet.classList.add('error');
            }
        }
    })
    nom.addEventListener('focus', () => {
        nom.classList.remove('error');
    })
    prenom.addEventListener('focus', () => {
        prenom.classList.remove('error');
    })
    sujet.addEventListener('focus', () => {
        sujet.classList.remove('error');
    })

    // Set the current date as the minimal value for the input date
    const date_input = document.getElementById('date');
    let current_date = new Date().toISOString().substring(0, 10);
    date_input.setAttribute("min", current_date);
    // Set the starting date
    date_input.addEventListener('change', () => {
        // initialize the planned_days array
        planned_days = [];
        // Get the selected date = starting date
        starting_date = date_input.value;
        // Check if the selected day is not a "Saturday" or "Sunday"
        if (getDayName(starting_date) !== 'Saturday' && getDayName(starting_date) !== 'Sunday') {
            // Clear the date error messages
            date_input.classList.remove('error');
            document.getElementById('date-error').innerHTML = '';
            document.getElementById('confirm-date-error').innerHTML = '';
            // Create a date object with the selected date
            const new_date = new Date(starting_date);
            // Setup the next date
            const next_date = new Date(+new_date);
            // Day incrementation starts at 0 to include the starting day first
            let day_plus = 0;
            // Add a day to the selected depending on how students number while ignoring weekends
            for (let i = 0; i < students.length; i++) {
                let next_day = next_date.getDate() + day_plus;
                next_date.setDate(next_day);
                ending_date = next_date.toISOString().substr(0, 10);
                // When the day is not a "Saturday" or "Sunday"
                if (getDayName(ending_date) !== 'Saturday' && getDayName(ending_date) !== 'Sunday') {
                    // Get the day, month and year from the date
                    let get_day = next_date.getDate();
                    let get_month = next_date.getMonth() + 1;
                    let get_year = next_date.getFullYear();
                    // Format it to the format supported by csv files
                    let csv_date = get_day + "-" + get_month + "-" + get_year;
                    // Push the formatted date to the planned days array
                    planned_days.push(csv_date);
                    // When the day is a weekend decrement i to skip the day
                } else {
                    i -= 1;
                }
                // Set the day incrementation to 1
                day_plus = 1;
            }
            // Show the starting and ending date of the planning
            document.getElementById('date-begin').innerHTML = starting_date;
            document.getElementById('date-end').innerHTML = ending_date;
            document.getElementById('date-confirm').classList.remove('disabled');
            document.getElementById('date-confirm').disabled = false;
            // When the selected day is a "Saturday" or "Sunday", show an error message
        } else {
            document.getElementById('date-error').innerHTML = 'Veuillez choisir une date valide (le jour ne doit pas être un Samedi ou un Dimanche).';
            date_input.classList.add('error');
            document.getElementById('date-confirm').classList.add('disabled');
            document.getElementById('date-confirm').disabled = true;
        }
    })
    // Confirm date selection and progress to step 4
    document.getElementById('date-confirm').addEventListener('click', (e) => {
        e.preventDefault();
        if (planned_days.length > 0) {
            // Unfocus all inputs and buttons
            unfocusFormElements();
            // Slide right then progress to step 4
            slideRight();
            document.querySelector('.planner__steps__progressbar').classList.add('step-4');
            document.getElementById('step-4').classList.add('active');
        } else {
            document.getElementById('confirm-date-error').innerHTML = 'Veuillez choisir une date de départ du planning des présentations.';
        }
    })
    // Index to set order and get the date from planned_days array
    let ordered_index = 0;
    // Random picker
    document.getElementById('randomizer').addEventListener('click', (e) => {
        e.preventDefault();
        // As long as there are entries in the students array
        if (students.length > 0) {
            document.getElementById('confirm-random-error').innerHTML = '';
            // Randomly draw a student
            random_student = students[Math.floor(Math.random() * students.length)];
            // Show the student
            document.querySelector('.result').innerHTML = JSON.stringify(random_student.name);
            // Remove the drawn student from the students array
            students = students.filter(name => name !== random_student)
            // Set the student's order and date
            random_student.order = ordered_index + 1;
            random_student.date = planned_days[ordered_index];
            // Push the student in the new array of ordered students
            ordered_students.push((random_student));
            // Increment the ordered index
            ordered_index++;
        }
    })
    // Confirm the random picking of the students then preview them in a table
    document.getElementById('confirm-random').addEventListener('click', (e) => {
        e.preventDefault();
        // When the students table is empty
        if (students.length == 0) {
            document.getElementById('confirm-random-error').innerHTML = '';
            // Unfocus all inputs and buttons
            unfocusFormElements();
            // Slide right then progress to step 5            
            slideRight();
            document.querySelector('.planner__steps__progressbar').classList.add('step-5');
            document.getElementById('step-5').classList.add('active');
            // Create table body
            let tbody = document.createElement('tbody');
            document.getElementById('students-table').appendChild(tbody);
            // Create table row for each student
            for (let i = 0; i < ordered_students.length; i++) {
                let row = document.createElement('tr');
                tbody.appendChild(row);
                let order = document.createElement('td');
                order.innerHTML = ordered_students[i].order;
                let fullname = document.createElement('td');
                fullname.innerHTML = ordered_students[i].name;
                let subject = document.createElement('td');
                subject.innerHTML = ordered_students[i].subject;
                let date = document.createElement('td');
                date.innerHTML = ordered_students[i].date;
                row.appendChild(order);
                row.appendChild(fullname);
                row.appendChild(subject);
                row.appendChild(date);
            }
        } else {
            document.getElementById('confirm-random-error').innerHTML = 'Veuillez choisir les étudiants restants au hazard (' + students.length + ').';
        }
    })
    // Download the list of students picked as a ".csv" file
    document.getElementById('download').addEventListener('click', () => {
        const csv_data = arrayToCsv(ordered_students);
        download(csv_data);
    });
})

// Any code that needs to run after the document fully loads with all the assets
window.addEventListener('load', () => {
    // Show the planner after the document fully loads
    document.querySelector('.planner').classList.remove('hidden');
    // Activate the animation for the steps numbers
    document.querySelectorAll('.planner__steps__number').forEach(steps_number => {
        steps_number.classList.add('animated');
    });
})
