
const cover = document.getElementById('cover');
const modalWindow = document.getElementById('modal');
document.querySelector('button[data-modal=rules]').onclick = showRules;


// Show/hide rules modal
function showRules(evt) {
    const urlToLoad = evt.target.getAttribute('data-modal') + '.html';
    axios.get(urlToLoad)
    .then(function (response) {
        modalWindow.classList.toggle('modal-is-visible');
        cover.classList.toggle('background-overlay');
        const closeBtnEl = document.createElement("div");
        modalWindow.innerHTML = response.data;
        modalWindow.appendChild(closeBtnEl);
        closeBtnEl.className = "modal-close-btn";
        closeBtnEl.onclick = function(evt) {
            cover.classList.toggle('background-overlay');
            modalWindow.innerHTML = "";
            modalWindow.classList.toggle('modal-is-visible');
        };
    })
    .catch(function (error) {
        console.log(error);
    })   
}