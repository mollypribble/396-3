const baseURL = 'http://localhost:8081';

// global variable storing all doctors
let allDocs;

// resets DB data when pressed and the page refreshed
const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

// event handles for adding new doc
const attachFormEventHandlers = () => {
    document.querySelector('#create').onclick=createDoc;
    document.querySelector('#cancel').onclick=cancelDoc;
}

//  called when user wants to add new doc
const newDoc = ev => {
    // get order number
    let numDocs = allDocs.length + 1;
    let strNumDocs = String(numDocs);

    // clear left panel if there are companions there
    document.querySelector('#companions').innerHTML  =  ``;
    // build form in middle panel
    document.querySelector('#doctor').innerHTML = `
        <form name="new-doc-form">
            <!-- Name -->
            <label for="name">Name</label>
            <input type="text" id="name">
            <div class = "spacer"></div>
    
            <!-- Seasons -->
            <label for="seasons">Seasons</label>
            <input type="text" id="seasons">
            <div class = "spacer"></div>
    
            <!-- Ordering -->
            <label for="ordering">Ordering</label>
            <input type="text" id="ordering" value=${strNumDocs}>
            <div class = "spacer"></div>
    
            <!-- Image -->
            <label for="image_url">Image</label>
            <input type="text" id="image_url">
            <div class = "spacer"></div>
    
            <!-- Buttons -->
            <button class="btn btn-main" id="create">Save</button>
            <button class="btn" id="cancel">Cancel</button>
        </form>`;
    // event handlers for new buttons that have appeared
    attachFormEventHandlers();
};

// helper for createDoc
// just checks if strings are empty
const checkEmpty = (str) => {
    if (str.length == 0) {
        return true;
    }
    return false;
}

// helper for createDoc
// changes array of  str to array of int/NaN values
const getSeasons = (seasons) => {
    const strArray = seasons.split(", ");
    let numArray = strArray.map(i => parseInt(i, 10));
    return numArray;
}

// helper for createDoc
// checks that season values are all integers
const checkSeasons = (seasons) => {
    if (seasons.includes(NaN)) {
        return true;
    }
    else {
        return false;
    }
}

// called when user trys to submit new doc info
const createDoc = ev =>{
    //get info from form
    let formName = document.forms["new-doc-form"]["name"].value;
    let formSeasons = document.forms["new-doc-form"]["seasons"].value;
    let formImage = document.forms["new-doc-form"]["image_url"].value;
    let formOrder = document.forms["new-doc-form"]["ordering"].value;
    let docId = ev.currentTarget.dataset.id;

    // initialize error message variable
    let errorMessage;

    // if there is already an error message from a previous attempt, delete it
    if (document.contains(document.getElementById("error"))) {
        document.getElementById("error").remove();
    }

    // initialize allGood variable that checks that all data is valid
    let allGood = true;

    // turn season array from strings to ints and check if there are any NaN values in the int array
    let numS = getSeasons(formSeasons);
    let checkS = checkSeasons(numS);

    // if there is no name throw this error message
    if (checkEmpty(formName)) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter name</p>
            </div>`;
    }
    // if there is no season(s) throw this error message
    else if (checkEmpty(formSeasons)) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter seasons</p>
            </div>`;
    }
    // if there were NaN values in the seasons input(s) throw this error message
    else if (checkS) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter valid seasons</p>
            </div>`;
    }
    // if there is  not image url throw this error message
    else if (checkEmpty(formImage)) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter image url</p>
            </div>`;
    }
    // if there are no errors, call constructor for the new doc view
    if (allGood) {
        buildDoc(formName, numS, formImage, formOrder, docId);
    }
    // if there was an error, display error message at the top of the middle panel
    else{
        document.querySelector('form').insertAdjacentHTML("beforebegin", errorMessage);
        attachFormEventHandlers();
    }
}

// called when user submits new doctor, after data is successfully validated
const buildDoc = (name, seasons, image, order, id) => {

    // put data in right format
    const docData = {
        name: name,
        seasons: seasons,
        image_url: image, 
        ordering: order
    }

    // fetch post new doctor data
    fetch(`${baseURL}/doctors`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(docData)
    })
        .then(response => response.json())
        .then(data => {
            // call page initializer again to update left panel
            initPage();
            // display new doctor details in middle panel
            document.querySelector('#doctor').innerHTML = `
                <h2>${data.name}</h2>
                <a class="edit-doctor" href="#" data-id="${id}">edit</a>
                <a class="delete-doctor" href="#" data-id="${id}">delete</a>
                <br>
                <img id="doc-img" src=${data.image_url} width=50%>
                <p>Seasons: ${data.seasons}</p>`;
        })
}

// called when user choose not to enter new doc
// literally just clears the middle panel
const cancelDoc = ev => {
    document.querySelector('#doctor').innerHTML = ``;
}

// event handlers for elements in left panel (doctors and add new doc button)
const attachEventHandlers = () => {
    document.querySelectorAll('#all-docs a').forEach(a => {
        a.onclick=doctorDetails;
    });
    document.querySelector('#new-doc').onclick=newDoc;
}

// event handlers for elements in middle panel (edit/delete)
const attachEditHandler = () => {
    document.querySelector('#doctor a').onclick=editDoc;
    document.querySelectorAll('#doctor a')[1].onclick=deleteDoc;
    
}

// function called when individual doctors in list are clicked
// displays doctor details in middle panel and companions in right panel
const doctorDetails = ev => {
    // get data id from node
    const id = ev.currentTarget.dataset.id;

    // find  doctor with corresponding id (no need to fetch again since this is  stored in allDocs)
    const doctor = allDocs.filter(doc => doc._id === id)[0];

    // display doc details in middle panel
    document.querySelector('#doctor').innerHTML = `
        <h2>${doctor.name}</h2>
        <a class="edit-doctor" href="#" data-id="${id}">edit</a>
        <a class="delete-doctor" href="#" data-id="${id}">delete</a>
        <br>
        <img id="doc-img" src=${doctor.image_url} width=50%>
        <p>Seasons: ${doctor.seasons}</p>`;

    // build url and fetch doctors companions
    const url = `${baseURL}/doctors/` + id + `/companions`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // display companions in right panel
            const comps = data.map(item => `
                <div>
                    <p class="single-comp" href="#" data-id="${item._id}">${item.name}</p>
                    <img id="comp-img" src=${item.image_url} height=100px>
                </div>`
            );
            document.getElementById('companions').innerHTML = `
            <div>
                ${comps.join('')}
            </div>`
        })
        // attach edit event handlers
        .then(attachEditHandler);
};

// event handlers for edit form
const attachEditFormEventHandlers = () => {
    document.querySelector('#cancel').onclick=doctorDetails;
    document.querySelector('#update').onclick=updateDoc;
}

// make changes with edit doc form
const patchDoc = (name, seasons, image, order, id) => {

    // put data in right  format
    const docData = {
        name: name,
        seasons: seasons,
        image_url: image, 
        ordering: order
    }
    
    // patch new  data into DB
    fetch(`${baseURL}/doctors/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(docData)
    })
        .then(response => response.json())
        // init page again with new data for doctor showing
        .then(data => {
            
            initPage();

            document.querySelector('#doctor').innerHTML = `
                <h2>${data.name}</h2>
                <a class="edit-doctor" href="#" data-id="${id}">edit</a>
                <a class="delete-doctor" href="#" data-id="${id}">delete</a>
                <br>
                <img id="doc-img" src=${data.image_url} width=50%>
                <p>Seasons: ${data.seasons}</p>`;
        })
        // attach event handlers for new edit and delete buttons
        .then(attachEditHandler);
}

// makes middle panel for editing current doc
const editDoc = ev => {
    // get id and find doc
    const id = ev.currentTarget.dataset.id;
    const doctor = allDocs.filter(doc => doc._id === id)[0];
    // calculate the order number for the doctor
    let numDocs = allDocs.indexOf(doctor) + 1;
    let strNumDocs = String(numDocs);

    // build middle panel
    document.querySelector('#doctor').innerHTML = `
        <form name="new-doc-form">
            <!-- Name -->
            <label for="name">Name</label>
            <input type="text" id="name" value="${doctor.name}">
            <div class = "spacer"></div>
    
            <!-- Seasons -->
            <label for="seasons">Seasons</label>
            <input type="text" id="seasons" value="${doctor.seasons}">
            <div class = "spacer"></div>
    
            <!-- Ordering -->
            <label for="ordering">Ordering</label>
            <input type="text" id="ordering" value="${strNumDocs}">
            <div class = "spacer"></div>
    
            <!-- Image -->
            <label for="image_url">Image</label>
            <input type="text" id="image_url" value="${doctor.image_url}">
            <div class = "spacer"></div>
    
            <!-- Buttons -->
            <button class="btn btn-main" id="update" data-id="${id}">Save</button>
            <button class="btn" id="cancel" data-id="${id}">Cancel</button>
        </form>`;
    // event handlers
    attachEditFormEventHandlers();
};

// delets doc from DB after user confirmation
const deleteDoc = ev => {

    // check for user confirmation
    if (window.confirm("Do you really want to delete?")){
        // get id and remove doc from allDocs
        const id = ev.currentTarget.dataset.id;
        const newDocs= allDocs.filter(doc => doc._id !== id)[0];
        allDocs = newDocs;

        //  delete doc from DB
        fetch(`${baseURL}/doctors/${id}`, {
            method: 'DELETE'
        })
            // rebuild page without doc and clear middle and right panel
            .then(data => {
                
                initPage();
    
                document.querySelector('#doctor').innerHTML = ``;
                document.getElementById('companions').innerHTML = ``;
            })
        
    }
};

// updates doc info after editing
const updateDoc = ev =>{
    // get user inputs for name, seasons, and image
    let formName = document.forms["new-doc-form"]["name"].value;
    let formSeasons = document.forms["new-doc-form"]["seasons"].value;
    let formImage = document.forms["new-doc-form"]["image_url"].value;
    let formOrder = document.forms["new-doc-form"]["ordering"].value;
    let docId = ev.currentTarget.dataset.id;

    // init error message and if there is already an error message remove it
    let errorMessage;
    if (document.contains(document.getElementById("error"))) {
        document.getElementById("error").remove();
    }

    // init allGood
    let allGood = true;

    // check that seasons are valid  inputs (i.e. numbers separated by ", ")
    let numS = getSeasons(formSeasons);
    let checkS = checkSeasons(numS);

    // if name is empty...
    if (checkEmpty(formName)) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter name</p>
            </div>`;
    }
    // if seasons is empty...
    else if (checkEmpty(formSeasons)) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter seasons</p>
            </div>`;
    }
    // if seasons are not valid...
    else if (checkS) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter valid seasons</p>
            </div>`;
    }
    // if  image is empty...
    else if (checkEmpty(formImage)) {
        allGood = false;
        errorMessage = `
            <div id="error">
                <p>Please enter image url</p>
            </div>`;
    }
    // if no errors were hit, patch through new data
    if (allGood) {
        patchDoc(formName, numS, formImage, formOrder, docId);
    }
    // else insert appropriate error message and then call event handlers again for form
    else{
        document.querySelector('form').insertAdjacentHTML("beforebegin", errorMessage);
        attachFormEventHandlers();
    }
}

// initial build of page when loaded and when new docs are added
const initPage = () => {
    // fetch all doctors currently in DB and store in allDocs
    fetch(`${baseURL}/doctors`)
        .then(response => response.json())
        .then(data => {
            allDocs = data;
            // make list items for each doctor
            const listItems = data.map(item => `
                <li>
                    <a class="single-doctor" href="#" data-id="${item._id}">${item.name}</a>
                </li>`
            );
            // add button to the end of the list
            listItems.push(`
                <button id="new-doc" class="btn">Add New Doctor</button>`
            );
            // display ordered list of docs
            document.getElementById('all-docs').innerHTML = `
                <ol>
                    ${listItems.join('')}
                </ol>`
        })
        // finally call event  handlers after button/doctors are rendered
        .then(attachEventHandlers);
}


// invoke these functions when the page loads:
initPage();
initResetButton();