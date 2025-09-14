let evaluations = [];

function showSection(section) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update sections - Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(section).classList.add('active');

    // If user clicks "Analytics", refresh the data
    if (section === 'analytics') {
    updateAnalytics();
    }
}

function calculatePaymentRecommendation(formData) {
    let score = 0;
    let factors = [];

    // Factor 1: Work benefits business (+3 points if yes)
    if (formData.workBenefit === 'yes') {
    score += 3;
    factors.push("Work directly benefits the business");
    }

    // Factor 2: Replaces employees (+4 points if yes)  
    if (formData.replaceWork === 'yes') {
    score += 4;
    factors.push("Replaces regular employee work");
    }

    // Factor 3: Internship type
    if (formData.internType === 'general') {
    score += 2;
    factors.push("General work experience (not academic)");
    } else if (formData.internType === 'vocational') {
    score += 1;
    factors.push("Vocational training program");
    }

    // Factor 4: Tasks performed
    const tasks = formData.tasks || [];
    if (tasks.includes('administrative') || tasks.includes('customer') || tasks.includes('production')) {
    score += 2;
    factors.push("Performs operational work tasks");
    }

    // Factor 5: Hours per week
    if (formData.hoursPerWeek === '31-40' || formData.hoursPerWeek === '40+') {
    score += 2;
    factors.push("Works full-time or near full-time hours");
    } else if (formData.hoursPerWeek === '21-30') {
    score += 1;
    factors.push("Works substantial hours per week");
    }

    // Factor 6: Duration
    if (formData.internshipDuration === '6+ months') {
    score += 1;
    factors.push("Long-term internship duration");
    }

    // Determine recommendation based on score
    const shouldPay = score >= 4;

    return {
    shouldPay: shouldPay,
    score: score,
    factors: factors,
    recommendation: shouldPay ? 
    "This intern should be paid based on labor law guidelines." :
    "This internship may qualify for unpaid status if properly structured for educational benefit."
    };
}

function submitForm(event) {
    event.preventDefault(); // Stop normal form submission

    // Disable submit button// Stop normal form submission
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Processing...';

    // Collect all form data
    const formData = new FormData(event.target);
    const data = {};

    // Handle regular fields
    for (let [key, value] of formData.entries()) {
    if (key === 'tasks') {
    if (!data[key]) data[key] = [];
    data[key].push(value);
    } else {
    data[key] = value;
    }
}

// Calculate recommendation
const analysis = calculatePaymentRecommendation(data);

// Create evaluation record
const evaluation = {
id: Date.now(),
timestamp: new Date().toISOString(),
data: data,
analysis: analysis,
userAgent: navigator.userAgent,
ipAddress: 'XXX.XXX.XXX.XXX', // Would be captured server-side
submissionTime: Date.now()
};

// Store evaluation (in production, this would be sent to your backend)
evaluations.push(evaluation);
localStorage.setItem('internEvaluations', JSON.stringify(evaluations));

// Simulate backend processing
setTimeout(() => {
// Show success message
document.getElementById('successMessage').style.display = 'block';

// Reset form
event.target.reset();

// Re-enable submit button
submitBtn.disabled = false;
submitBtn.innerHTML = '📋 Submit Evaluation';

// Scroll to success message
document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });

// Auto-hide success message after 5 seconds
setTimeout(() => {
document.getElementById('successMessage').style.display = 'none';
}, 5000);

console.log('Evaluation submitted:', evaluation);
}, 1500);
}

function updateAnalytics() {
// Load evaluations from localStorage
evaluations = JSON.parse(localStorage.getItem('internEvaluations') || '[]');

// Update statistics
const total = evaluations.length;
const paid = evaluations.filter(e => e.analysis.shouldPay).length;
const unpaid = total - paid;
const paidPercentage = total > 0 ? Math.round((paid / total) * 100) : 0;

document.getElementById('totalEvaluations').textContent = total;
document.getElementById('paidRecommendations').textContent = paid;
document.getElementById('unpaidRecommendations').textContent = unpaid;
document.getElementById('paidPercentage').textContent = paidPercentage + '%';

// Update recent recommendations
updateRecentRecommendations();

// Update table
updateResponsesTable();
}

function updateRecentRecommendations() {
const container = document.getElementById('recentRecommendations');

if (evaluations.length === 0) {
container.innerHTML = '<p>No evaluations yet. Submit the form to see recommendations here.</p>';
return;
}

const recent = evaluations.slice(-3).reverse();
let html = '';

recent.forEach(evaluation => {
const date = new Date(evaluation.timestamp).toLocaleDateString();
const className = evaluation.analysis.shouldPay ? 'recommendation' : 'recommendation unpaid';

html += `
<div class="${className}">
    <strong>${evaluation.data.companyName}</strong> - ${date}
    <br>
    <small>${evaluation.analysis.recommendation}</small>
    <br>
    <small><strong>Score:</strong> ${evaluation.analysis.score}/10 | 
    <strong>Factors:</strong> ${evaluation.analysis.factors.length} indicators</small>
</div>
`;
});

container.innerHTML = html;
}

function updateResponsesTable() {
const tbody = document.getElementById('responsesTableBody');

if (evaluations.length === 0) {
tbody.innerHTML = `
<tr>
    <td colspan="7" style="text-align: center; padding: 40px; color: #6c757d;">
        No evaluations submitted yet
    </td>
</tr>
`;
return;
}

let html = '';

evaluations.reverse().forEach(evaluation => {
const date = new Date(evaluation.timestamp).toLocaleDateString();
const badge = evaluation.analysis.shouldPay ? 
'<span class="paid-badge">SHOULD PAY</span>' : 
'<span class="unpaid-badge">CAN BE UNPAID</span>';

html += `
<tr>
    <td>${date}</td>
    <td>${evaluation.data.companyName}</td>
    <td>${evaluation.data.evaluatorName}</td>
    <td>${evaluation.data.internshipDuration || 'N/A'}</td>
    <td>${evaluation.data.hoursPerWeek || 'N/A'}</td>
    <td>${badge}</td>
    <td>${evaluation.analysis.score}/10</td>
</tr>
`;
});

tbody.innerHTML = html;
}

function exportToCSV() {
if (evaluations.length === 0) {
alert('No data to export');
return;
}

let csv = 'Date,Company,Evaluator,Email,Intern Name,Duration,Hours/Week,Work Benefits,Replaces Work,Type,Tasks,Recommendation,Score,Factors\n';

evaluations.forEach(evaluation => {
const date = new Date(evaluation.timestamp).toLocaleDateString();
const data = evaluation.data;
const analysis = evaluation.analysis;

const tasks = (data.tasks || []).join('; ');
const factors = analysis.factors.join('; ');
const recommendation = analysis.shouldPay ? 'SHOULD PAY' : 'CAN BE UNPAID';

csv += `"${date}","${data.companyName}","${data.evaluatorName}","${data.evaluatorEmail}","${data.internName || ''}","${data.internshipDuration || ''}","${data.hoursPerWeek || ''}","${data.workBenefit}","${data.replaceWork}","${data.internType}","${tasks}","${recommendation}","${analysis.score}","${factors}"\n`;
});

downloadFile(csv, 'intern_evaluations.csv', 'text/csv');
}

function exportToJSON() {
if (evaluations.length === 0) {
alert('No data to export');
return;
}

const jsonData = JSON.stringify(evaluations, null, 2);
downloadFile(jsonData, 'intern_evaluations.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
const blob = new Blob([content], { type: contentType });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
window.URL.revokeObjectURL(url);
}

// Initialize with sample data for demonstration
function initializeSampleData() {
if (localStorage.getItem('internEvaluations')) return;

const sampleEvaluations = [
{
id: 1,
timestamp: new Date(Date.now() - 86400000).toISOString(),
data: {
    companyName: 'TechStart Inc.',
    evaluatorName: 'Sarah Johnson',
    evaluatorEmail: 'sarah@techstart.com',
    internName: 'Alex Chen',
    internshipDuration: '3-6 months',
    workBenefit: 'yes',
    replaceWork: 'yes',
    internType: 'general',
    tasks: ['administrative', 'customer'],
    hoursPerWeek: '31-40'
},
analysis: {
    shouldPay: true,
    score: 8,
    factors: ['Work directly benefits the business', 'Replaces regular employee work', 'General work experience (not academic)', 'Performs operational work tasks', 'Works full-time or near full-time hours'],
    recommendation: 'This intern should be paid based on labor law guidelines.'
}
},
{
id: 2,
timestamp: new Date().toISOString(),
data: {
    companyName: 'Academic Partners LLC',
    evaluatorName: 'Mike Rodriguez',
    evaluatorEmail: 'mike@academicpartners.com',
    internName: 'Jamie Smith',
    internshipDuration: '1-3 months',
    workBenefit: 'no',
    replaceWork: 'no',
    internType: 'academic',
    tasks: ['observation', 'training'],
    hoursPerWeek: '11-20'
},
analysis: {
    shouldPay: false,
    score: 0,
    factors: [],
    recommendation: 'This internship may qualify for unpaid status if properly structured for educational benefit.'
}
}
];

localStorage.setItem('internEvaluations', JSON.stringify(sampleEvaluations));
}

// Initialize on page load
initializeSampleData();
updateAnalytics();