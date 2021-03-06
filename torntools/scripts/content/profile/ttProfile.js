profileLoaded().then(function(){
    console.log("TT - Profile");

    let user_faction = userdata.faction.faction_name;

    if(settings.pages.profile.show_id){
        showId();
    }

    if(settings.pages.profile.friendly_warning){
        displayAlly(user_faction, allies);
    }

    if(target_list.show){
        displayTargetInfo(target_list.targets);
    }
        
    if(settings.pages.profile.loot_times){
        displayLootLevel(loot_times);
    }

    if(settings.pages.profile.status_indicator){
        addStatusIndicator();
    }
    displayCreator();
});

function displayCreator() {
    let name = doc.find("#skip-to-content span") || doc.find("#skip-to-content");

    if (name.innerText == "Mephiles' Profile" || name.innerText == "Mephiles [2087524]") {
        let span1 = doc.new({type: "span", text: " - Thanks for using ", attributes: {
            style: `font-size: 17px;`
        }});

        let span2 = doc.new({type: "span", text: "TornTools", attributes: {
            style: `font-size: 17px; color: #6b8817;`
        }});

        span1.appendChild(span2);
        name.appendChild(span1);
    }
}

function profileLoaded() {
    let promise = new Promise(function (resolve, reject) {
        let counter = 0;
        let checker = setInterval(function () {
            if (document.querySelector(".basic-information ul.basic-list li")) {
                resolve(true);
                return clearInterval(checker);
            } else if (counter > 10000) {
                resolve(false);
                return clearInterval(checker);
            } else
                counter++;
        }, 100);
    });

    return promise.then(function (data) {
        return data;
    });
}

function displayAlly(user_faction, allies) {
    let profile_faction = doc.find(".basic-information ul.basic-list li:nth-of-type(3) div:nth-of-type(2)").innerText;

    if (user_faction == profile_faction) {
        showWarning('user');
        return;
    }

    for (let ally of allies) {
        if (ally.trim() == profile_faction) {
            showWarning('ally');
            return;
        }
    }
}

function showWarning(type) {
    let title = doc.find(".profile-left-wrapper .title-black");
    let span = document.createElement("span");
    span.setClass("tt-warning-message");

    if (type == 'user')
        span.innerText = "This user is in your faction!";
    else if (type == 'ally')
        span.innerText = "This user is an ally!";

    title.appendChild(span);
}

function displayTargetInfo(targets) {
    let user_id = getUserId();

    let info_container = content.new_container("Target Info", {next_element_heading: "Medals", id: "tt-target-info"});
    let content_container = info_container.find(".content");

    if (!targets[user_id])
        content_container.innerText = "No data on user.";
    else {
        let table = doc.new("div");
        table.setClass("tt-table");

        let headings = [
            { name: "Wins", type: "win", class: "good tt-item" },
            { name: "Mugs", type: "mug", class: "good tt-item" },
            { name: "Leaves", type: "leave", class: "good tt-item" },
            { name: "Hosps", type: "hosp", class: "good tt-item" },
            { name: "Arrests", type: "arrest", class: "good tt-item" },
            { name: "Specials", type: "special", class: "good tt-item" },
            { name: "Assists", type: "assist", class: "good tt-item" },
            { name: "Defends", type: "defend", class: "good tt-item" },
            { name: "Lost", type: "lose", class: "new-section bad tt-item" },
            { name: "Defends lost", type: "defend_lose", class: "bad tt-item" },
            { name: "Stalemates", type: "stalemate", class: "bad tt-item" },
            { name: "Stealths", type: "stealth", class: "new-section neutral tt-item" },
            { name: "Respect", type: "respect_base", class: "neutral tt-item" }
        ]

        // header row
        let header_row = doc.new("div");
        header_row.setClass("tt-header-row tt-row");

        for (let heading of headings) {
            let th = doc.new("div");
            th.innerText = heading.name;
            th.setClass(heading.class);
            header_row.appendChild(th);
        }

        // data row
        let row = doc.new("div");
        row.setClass("tt-row");

        for (let heading of headings) {
            let td = doc.new("div");
            td.setClass(heading.class);

            if (heading.name == "Respect") {
                let [value, color] = getRespect(targets, user_id);
                td.innerText = value;
                td.style.backgroundColor = color;
            } else
                td.innerText = targets[user_id][heading.type];

            row.appendChild(td);
        }

        // compiling
        table.appendChild(header_row);
        table.appendChild(row);
        content_container.appendChild(table);
    }
}

function getUserId() {
    return doc.find(".basic-information ul.basic-list li:nth-of-type(1) div:nth-of-type(2)").innerText.split("[")[1].replace("]", "");
}

function getRespect(target_list, id) {
    let respect_type = "respect";
    let respect_value;
    let color;

    for (let list in target_list[id]["respect_base"]) {
        if (target_list[id]["respect_base"][list].length > 0) {
            respect_type = "respect_base";
            break;
        }
    }

    let leaves = target_list[id][respect_type]["leave"].length > 0 ? true : false;

    if (leaves)
        respect_value = getAverage(target_list[id][respect_type]["leave"]);
    else {
        let averages = [];

        for (let list in target_list[id][respect_type]) {
            let avrg_of_list = getAverage(target_list[id][respect_type][list]);

            if (avrg_of_list != 0)
                averages.push(avrg_of_list);
        }
        respect_value = getAverage(averages);
    }

    if (respect_type == "respect")
        respect_value = respect_value + "*";
    else if (respect_type == "respect_base") {
        if (leaves)
            color = "#dfffdf";
        else
            color = "#fffdcc";
    }

    if (respect_value == "0*")
        respect_value = "-"

    return [respect_value, color];
}

function getAverage(arr) {
    if (arr.length == 0)
        return 0;

    let sum = 0;
    for (let item of arr) {
        sum += item;
    }
    return parseFloat((sum / arr.length).toFixed(2));
}

function showId(){
    let text = doc.find(`.profile-container .basic-list>li .user-info-value`).innerText;
    doc.find("#skip-to-content").innerText = text;
}

function displayLootLevel(loot_times){
    console.log(loot_times)
    let profile_id = doc.find(`.profile-container .basic-list>li .user-info-value`).innerText.split(" [")[1].replace("]", "");
    
    if(profile_id in loot_times){
        let current_time = parseInt(((new Date().getTime())/ 1000).toFixed(0));
        let next_level = loot_times[profile_id].levels.next;
        let next_loot_time = loot_times[profile_id].timings[next_level].ts;
        let time_left;

        if(next_loot_time - current_time <= 60){  // New info hasn't been fetched yet
            next_level = next_level+1 > 5 ? 1 : next_level+1;
            next_loot_time = loot_times[profile_id].timings[next_level].ts;
            time_left = time_until((next_loot_time - current_time)*1000);
        } else {
            time_left = time_until((next_loot_time - current_time)*1000);
        }
        
        let span = doc.new("span");
            span.setClass("tt-loot-time");
            span.innerText = `Next loot level in: ${time_left}`;
            span.setAttribute("seconds", (next_loot_time - current_time));
        
        doc.find(".profile-wrapper .profile-status .description .sub-desc").appendChild(span);
        
        // Time decrease
        let time_decrease = setInterval(function(){
            let seconds = parseInt(span.getAttribute("seconds"));
            let time_left = time_until((seconds-1)*1000);

            span.innerText = `Next loot in: ${time_left}`;
            span.setAttribute("seconds", seconds-1);
        }, 1000);
    }
}

function addStatusIndicator(){
    let status_icon = doc.find(".icons ul>li");
    let icon_span = doc.new({type: "div", class: status_icon.classList[0], attributes: {
        style: `margin-top: 1px; margin-right: 3px; float: left; background-position: ${window.getComputedStyle(status_icon).getPropertyValue('background-position')};`
    }});
    let text_span = doc.new({type: "span", text: doc.find("#skip-to-content").innerText, attributes: {
        style: `font-size: 22px; color: #333;`
    }});

    doc.find("#skip-to-content").innerText = "";
    doc.find("#skip-to-content").appendChild(icon_span);
    doc.find("#skip-to-content").appendChild(text_span);

    // Event listener
    let status_observer = new MutationObserver(function(mutationsList, observer){
        for(let mutation of mutationsList){
            console.log("MUTATION", mutation);
            if(mutation.type == "childList"){
                console.log(doc.find(".icons ul>li"));
                icon_span.setAttribute("class", doc.find(".icons ul>li").classList[0]);
                icon_span.style.backgroundPosition = window.getComputedStyle(doc.find(".icons ul>li")).getPropertyValue('background-position');
            }
        }
    });
    status_observer.observe(status_icon.parentElement, {childList: true});
}