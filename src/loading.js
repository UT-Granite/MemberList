
function initLoadLoaddings(mainElm){
    const loadingPanels = document.createElement('div');
    const holds = [];
    loadingPanels.id = 'loading_panels';
    mainElm.appendChild(loadingPanels);
    for (let i = 0; i<8;i++){
        const hold = document.createElement("img");
        holds.push(hold);
        hold.src = `./src/img/loading/${i}.svg`;
        hold.className = "nomal_hold";
        hold.style.filter = `saturate(1)`;
        hold.id = `hold${i}`;
        loadingPanels.appendChild(hold);
        
    }
    holds[2].style.filter=("saturate(0)");
    return {parent:loadingPanels,hold:holds};
}