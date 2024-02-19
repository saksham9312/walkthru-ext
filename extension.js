//****************Recording the tour*********************//

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let tourData = { name: "", description: "", steps: [] };

// Function to prompt user for tour name and description
async function promptForTourInfo() {
    const name = await vscode.window.showInputBox({
        prompt: "Enter tour name:"
    });
    const description = await vscode.window.showInputBox({
        prompt: "Enter tour description:"
    });
    tourData.name = name;
    tourData.description = description;
}

// Function to prompt user for step description
async function promptForStepDescription() {
    return vscode.window.showInputBox({
        prompt: "Enter step description (optional):"
    });
}

// Function to save tour data to a file
function saveTourData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        vscode.window.showInformationMessage(`Tour data saved to ${filePath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error saving tour data: ${error.message}`);
    }
}

// Function to activate the extension
function activate(context) {
    console.log('Congratulations, your extension "code-tour-extension" is now active!');

    // Create and show the tree view
    createTreeView();
    // Define command for starting a new tour
    let startTourDisposable = vscode.commands.registerCommand('extension.startTour', async () => {
        await promptForTourInfo();
    });

    // Define command for adding a step to the tour
    let addStepDisposable = vscode.commands.registerCommand('extension.addTourStep', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor.");
            return;
        }

        const description = await promptForStepDescription();
        if (description) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            const file = vscode.workspace.asRelativePath(editor.document.uri);
            const step = {
                file: file,
                line: selection.start.line + 1, // Line numbers are 0-based, but tour expects 1-based
                description: description,
                text: text
            };
            tourData.steps.push(step);
            vscode.window.showInformationMessage("Step added to tour.");
        }
    });

    // Define command for saving tour data to a JSON file
    let saveTourDisposable = vscode.commands.registerCommand('extension.saveTour', async () => {
        const projectName = vscode.workspace.name;
        const tourName = tourData.name.replace(/\s+/g, '-').toLowerCase(); // Convert tour name to lowercase and replace spaces with hyphens
        const tourFileName = `${tourName}.json`;
        const toursDir = path.join(vscode.workspace.rootPath, '.tours');
        if (!fs.existsSync(toursDir)) {
            fs.mkdirSync(toursDir);
        }
        const filePath = path.join(toursDir, tourFileName);
        saveTourData(filePath, tourData);
    });

    context.subscriptions.push(startTourDisposable, addStepDisposable, saveTourDisposable);
}

// Function to deactivate the extension
function deactivate() {}

module.exports = {
    activate,
    deactivate
};






//****************Playbacking the tour*********************//


// const vscode = require('vscode');
// const fs = require('fs');

// // Define a decoration type
// const codeTourDecorationType = vscode.window.createTextEditorDecorationType({
//     backgroundColor: 'rgba(255, 255, 0, 0.3)', // Yellow highlight
//     isWholeLine: false
// });

// // Function to read JSON data from file
// function readJSONFromFile(filePath) {
//     try {
//         const jsonData = fs.readFileSync(filePath, 'utf8');
//         return JSON.parse(jsonData);
//     } catch (error) {
//         console.error('Error reading JSON file:', error);
//         return null;
//     }
// }

// // Function to playback the tour
// async function playbackTour(tourData) {
//     if (!tourData || !tourData.steps || tourData.steps.length === 0) {
//         console.error('Invalid tour data');
//         return;
//     }

//     let stepIndex = 0;

//     while (stepIndex < tourData.steps.length) {
//         const step = tourData.steps[stepIndex];

//         // Display current step description
//         vscode.window.showInformationMessage(step.description);

//         if (step.file && step.line) {
//             const document = await vscode.workspace.openTextDocument(vscode.Uri.file(step.file));
//             var editor = await vscode.window.showTextDocument(document);

//             // Highlight the line of code
//             const line = step.line - 1; // Line numbers are 1-based, vscode uses 0-based
//             const decoration = { range: new vscode.Range(line, 0, line, Number.MAX_VALUE) };
//             editor.setDecorations(codeTourDecorationType, [decoration]);

//             // Scroll to the highlighted line
//             editor.revealRange(new vscode.Range(line, 0, line, 0), vscode.TextEditorRevealType.InCenter);
//         }

//         const options = ['Next', 'Previous', 'Stop'];
//         const choice = await vscode.window.showQuickPick(options, {
//             placeHolder: `Step ${stepIndex + 1}/${tourData.steps.length}`,
//         });

//         if (!choice || choice === 'Stop') {
//             break;
//         } else if (choice === 'Next') {
//             stepIndex = Math.min(stepIndex + 1, tourData.steps.length - 1);
//             if(stepIndex == tourData.steps.length) break;
//         } else if (choice === 'Previous') {
//             stepIndex = Math.max(0, stepIndex - 1);
//         }

//         // Clear the decoration after moving to the next step
//         editor.setDecorations(codeTourDecorationType, []);
//     }
// }

// // Function to activate the extension
// function activate(context) {
//     console.log('Congratulations, your extension "code-tour-extension" is now active!');

//     // Define command for playback
//     let disposable = vscode.commands.registerCommand('extension.playbackTour', async () => {
//         const tourFilePath = await vscode.window.showInputBox({
//             prompt: "Enter the path to the CodeTour JSON file:"
//         });

//         if (!tourFilePath) {
//             vscode.window.showErrorMessage("No file path provided.");
//             return;
//         }

//         const tourData = readJSONFromFile(tourFilePath);
//         if (tourData) {
//             // Start playback tour
//             await playbackTour(tourData);
//         } else {
//             vscode.window.showErrorMessage("Error reading tour data.");
//         }
//     });

//     context.subscriptions.push(disposable);
// }

// // Function to deactivate the extension
// function deactivate() {}

// module.exports = {
//     activate,
//     deactivate
// };
