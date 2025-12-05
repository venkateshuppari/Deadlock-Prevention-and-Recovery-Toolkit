let currentAllocation = [],
    currentMax = [],
    currentAvailable = [],
    currentNeed = [],
    currentProcessCount = 0,
    currentResourceCount = 0;

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function parseInput(text) {
    return text.trim() ? text.trim().split("\n").map(row => row.split(",").map(val => {
        const num = parseInt(val.trim());
        return isNaN(num) ? 0 : num;
    })) : null;
}

function parseArray(text) {
    return text.trim() ? text.trim().split(",").map(val => {
        const num = parseInt(val.trim());
        return isNaN(num) ? 0 : num;
    }) : null;
}

function validateInputs(allocation, max, available) {
    if (!allocation || !max || !available) {
        showOutput("Please enter valid matrices in all fields.", "error");
        return false;
    }
    if (allocation.length !== max.length) {
        showOutput("Allocation and Max matrices must have the same number of processes.", "error");
        return false;
    }
    const resourceCount = allocation[0].length;
    if (available.length !== resourceCount) {
        showOutput("Available resources must match the number of resources in the matrices.", "error");
        return false;
    }
    for (let i = 0; i < allocation.length; i++) {
        if (allocation[i].length !== resourceCount || max[i].length !== resourceCount) {
            showOutput("All rows must have the same number of resources.", "error");
            return false;
        }
        for (let j = 0; j < resourceCount; j++) {
            if (allocation[i][j] > max[i][j]) {
                showOutput(`Process ${i} has allocation greater than max for resource ${j}.`, "error");
                return false;
            }
        }
    }
    return true;
}

function runBankersAlgorithm() {
    const allocation = parseInput(document.getElementById("allocationInput").value),
        max = parseInput(document.getElementById("maxInput").value),
        available = parseArray(document.getElementById("availableInput").value);
    
    if (!validateInputs(allocation, max, available)) return;
    
    currentAllocation = allocation;
    currentMax = max;
    currentAvailable = available;
    currentProcessCount = allocation.length;
    currentResourceCount = available.length;
    currentNeed = max.map((maxRow, i) => maxRow.map((maxVal, j) => maxVal - allocation[i][j]));
    
    const safeSequence = bankersAlgorithm(allocation, max, available);
    
    if (safeSequence.length > 0) {
        showSafeSequence(safeSequence);
        showOutput(`System is in a safe state.`, "success");
    } else {
        document.getElementById("safeSequenceContainer").innerHTML = "";
        showOutput("System is in unsafe state. Deadlock possible!", "error");
    }
    
    updateProcessDetails();
}

function bankersAlgorithm(allocation, max, available) {
    const numProcesses = allocation.length,
        numResources = available.length,
        work = [...available],
        finish = Array(numProcesses).fill(false),
        safeSequence = [],
        need = max.map((maxRow, i) => maxRow.map((maxVal, j) => maxVal - allocation[i][j]));
    
    for (let count = 0; count < numProcesses; count++) {
        let found = false;
        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i] && need[i].every((needVal, j) => needVal <= work[j])) {
                for (let j = 0; j < numResources; j++) {
                    work[j] += allocation[i][j];
                }
                finish[i] = true;
                safeSequence.push(i);
                found = true;
                break;
            }
        }
        if (!found) return [];
    }
    return safeSequence;
}

function showSafeSequence(sequence) {
    const container = document.getElementById("safeSequenceContainer");
    container.innerHTML = `
        <div class="safe-sequence">
            <h3>Safe Execution Sequence</h3>
            <div>
                ${sequence.map((p, i) => `
                    <span class="safe-sequence-step">P${p}</span>
                    ${i < sequence.length - 1 ? '<span class="safe-sequence-arrow">→</span>' : ''}
                `).join('')}
            </div>
            <p>This sequence shows one possible order in which processes can execute without causing a deadlock.</p>
        </div>
    `;
}

function detectDeadlock() {
    const allocation = parseInput(document.getElementById("allocationInput").value),
        available = parseArray(document.getElementById("availableInput").value);
    
    if (!allocation || !available) {
        showOutput("Please enter valid allocation matrix and available resources.", "error");
        return;
    }
    
    currentAllocation = allocation;
    currentAvailable = available;
    currentProcessCount = allocation.length;
    currentResourceCount = available.length;
    
    const deadlockExists = deadlockDetection(allocation, available);
    deadlockExists ?
        showOutput("Deadlock detected! One or more processes are deadlocked.", "error") :
        showOutput("No deadlock detected. All processes can complete.", "success");
    
    updateProcessDetails();
}

function deadlockDetection(allocation, available) {
    const numProcesses = allocation.length,
        numResources = available.length,
        work = [...available],
        finish = Array(numProcesses).fill(false);
    
    for (let i = 0; i < numProcesses; i++) {
        if (allocation[i].every(val => val === 0)) {
            finish[i] = true;
        }
    }
    
    let canProceed = true;
    while (canProceed) {
        canProceed = false;
        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i] && allocation[i].every((allocVal, j) => allocVal <= work[j])) {
                for (let j = 0; j < numResources; j++) {
                    work[j] += allocation[i][j];
                }
                finish[i] = true;
                canProceed = true;
            }
        }
    }
    
    return finish.includes(false);
}

function applyPrevention(method) {
    if (currentAllocation.length === 0) {
        showOutput("Please load or enter a system state first.", "error");
        return;
    }
    
    let message = "";
    switch (method) {
        case 'mutual-exclusion':
            message = "Mutual Exclusion: Only allow one process to access non-sharable resources at a time.";
            break;
        case 'hold-wait':
            message = "Hold and Wait: Require processes to request all resources at once or release all held resources before requesting new ones.";
            break;
        case 'no-preemption':
            message = "No Preemption: If a process can't get a resource, it releases all held resources and waits.";
            break;
        case 'circular-wait':
            message = "Circular Wait: Impose a total ordering of resource types and require processes to request resources in order.";
    }
    
    document.getElementById("preventionOutput").innerHTML = `
        <h4>${method.replace('-', ' ').toUpperCase()}</h4>
        <p>${message}</p>
        <p>This prevention method would modify the system to avoid one of the four necessary conditions for deadlock.</p>
    `;
}

function applyRecovery(method) {
    if (currentAllocation.length === 0) {
        showOutput("Please load or enter a system state first.", "error");
        return;
    }
    
    let message = "", action = "";
    switch (method) {
        case 'process-termination':
            message = "Process Termination: Select processes to terminate until deadlock is resolved.";
            action = "Would terminate one or more deadlocked processes (e.g., P2, P4) to release resources.";
            break;
        case 'resource-preemption':
            message = "Resource Preemption: Select resources to preempt from processes and allocate to others.";
            action = "Would preempt resources from some processes (e.g., R1 from P3) to break the deadlock.";
    }
    
    document.getElementById("recoveryOutput").innerHTML = `
        <h4>${method.replace('-', ' ').toUpperCase()}</h4>
        <p>${message}</p>
        <p>${action}</p>
    `;
}

function showOutput(message, type) {
    const output = document.getElementById("output");
    output.innerHTML = `<p class="${type}-message">${message}</p>`;
}

function clearInputs() {
    document.getElementById("allocationInput").value = "";
    document.getElementById("maxInput").value = "";
    document.getElementById("availableInput").value = "";
    document.getElementById("output").innerHTML = "<p>Run an analysis to see results here.</p>";
    document.getElementById("safeSequenceContainer").innerHTML = "";
    currentAllocation = [];
    currentMax = [];
    currentAvailable = [];
    currentNeed = [];
    document.getElementById("processDetails").innerHTML = "";
}

function updateProcessDetails() {
    if (currentAllocation.length === 0) return;
    
    const detailsContainer = document.getElementById("processDetails");
    detailsContainer.innerHTML = "";
    
    for (let i = 0; i < currentAllocation.length; i++) {
        const processDiv = document.createElement("div");
        processDiv.className = "resource-item";
        
        let allocationStr = currentAllocation[i].map((val, j) => `R${j}: ${val}`).join(", "),
            maxStr = currentMax[i].map((val, j) => `R${j}: ${val}`).join(", "),
            needStr = currentNeed[i].map((val, j) => `R${j}: ${val}`).join(", ");
        
        processDiv.innerHTML = `
            <h4>Process P${i}</h4>
            <p><strong>Allocation:</strong> ${allocationStr}</p>
            <p><strong>Max:</strong> ${maxStr}</p>
            <p><strong>Need:</strong> ${needStr}</p>
        `;
        detailsContainer.appendChild(processDiv);
    }
    
    const availableDiv = document.createElement("div");
    availableDiv.className = "resource-item";
    availableDiv.style.borderLeftColor = "#f39c12";
    
    let availableStr = currentAvailable.map((val, j) => `R${j}: ${val}`).join(", ");
    availableDiv.innerHTML = `
        <h4>Available Resources</h4>
        <p>${availableStr}</p>
    `;
    detailsContainer.appendChild(availableDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize with empty state
});
