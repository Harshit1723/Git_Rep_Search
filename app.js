function fetchUserData() {
    var username = document.getElementById('username').value;
    var apiURL = `https://api.github.com/search/users?q=${username}`;
    var loader = document.getElementById('loader');
    
    
    loader.style.display = 'block';

    fetch(apiURL).then(response => response.json())
        .then(data => {
           
            loader.style.display = 'none';
            displayResult(data);
        })
        .catch(error => {
         
            loader.style.display = 'none';
            console.error('Error Fetching Data:', error);
            displayResult({ error: 'Error Fetching Data' });
        });
}

function displayResult(data) {
    var resultDiv = document.getElementById('result');

    if(data.error){
        resultDiv.innerHTML = `<p>${data.error}</p>`;
    }else{
        var userList = document.createElement('ul');

        data.items.forEach(item => {
            var listItem = document.createElement('li');
            var userContainer = document.createElement('div');
            userContainer.classList.add('user-container');

            //Creating an image element
            var userImage = document.createElement('img');
            userImage.src=item.avatar_url;
            userImage.alt=`${item.login} Avatar`

            //Applying classnames to this image
            userImage.classList.add('user-image');

            //Create a button element
            var userButton = document.createElement('button');
            userButton.textContent = item.login;
            userButton.onclick = function() {
                fetchUserRepos(item.login);
            };

            //Applying classnames to this button
            userButton.classList.add('user-button');

            //Append image and button to the container
            userContainer.appendChild(userImage);
            userContainer.appendChild(userButton);

            listItem.appendChild(userContainer);

            userList.appendChild(listItem);
        });

        resultDiv.innerHTML = '<p>User(s) found:</p>';
        resultDiv.appendChild(userList);
    }
}

function fetchUserDetails(username) {
    var userDetailsURL = `https://api.github.com/users/${username}`;

    return fetch(userDetailsURL)
        .then(response => response.json())
        .catch(error => {
            console.error('Error Fetching User Details:', error);
            return { error: 'Error Fetching User Details' };
        });
}

var currentPage = 1;
var repositoriesPerPage = 10;


function fetchUserRepos(username) {
    var userDetailsPromise = fetchUserDetails(username);
    var reposURL = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`;
    var reposPromise = fetch(reposURL)
        .then(response => response.json())
        .catch(error => {
            console.error('Error Fetching Repositories:', error);
            return [{ name: 'Error Fetching Repositories' }];
        });

    var loader = document.getElementById('loader');

   
    loader.style.display = 'block';

    Promise.all([userDetailsPromise, reposPromise])
        .then(([userDetails, repos]) => {
            
            loader.style.display = 'none';
            displayUserDetails(username, userDetails);
            displayUserRepos(username, repos);
            displayPaginationButtons(username, userDetails.public_repos);
        });
}




function displayUserDetails(username, userDetails) {
    var resultDiv = document.getElementById('result');

    if (userDetails.error) {
        resultDiv.innerHTML = `<p>Error Fetching User Details for ${username}: ${userDetails.error}</p>`;
    } else {
        resultDiv.innerHTML = `
           <div class="user-details">
           <img src="${userDetails.avatar_url}" alt="${username} Avatar" class="user-avatar">

           <div class="copy">
            <p class="name">Name: ${userDetails.name}</p>

            <p>Bio: ${userDetails.bio || 'N/A'}</p>
            <p>Location:${userDetails.location ||'N/A'}</p>
            <p>Twitter: ${userDetails.twitter_username ? `<a href="https://twitter.com/${userDetails.twitter_username}" target="_blank">${userDetails.twitter_username}</a>` : 'N/A'}</p>
            </div>
        
        </div>    `;
    }
}

function displayUserRepos(username, repos) {
    var resultDiv = document.getElementById('result');
    var reposList = document.createElement('ul');
    reposList.classList.add('repo-container');

    if (repos[0].name === 'Error Fetching Repositories') {
        resultDiv.innerHTML += `<p>Error Fetching Repositories for ${username}: ${repos[0].name}</p>`;
    } else {
        repos.forEach(repo => {
            var listItem = document.createElement('li');
            listItem.classList.add('repo-item');

            // Display repo name
            var repoName = document.createElement('p');
            repoName.textContent = `Repository : ${repo.name}`;
            repoName.classList.add('simple-repo-name');
            listItem.appendChild(repoName);

           
            if (repo.description) {
                var repoDescription = document.createElement('p');
                repoDescription.textContent = `Description: ${repo.description}`;
                repoDescription.classList.add('simple-repo-description');
                listItem.appendChild(repoDescription);
            }

            
            if (repo.language) {
                var repoLanguageWrapper = document.createElement('div'); 
                repoLanguageWrapper.classList.add('repo-language-wrapper');
            
                var repoLanguage = document.createElement('p');
                repoLanguage.textContent = ` ${repo.language}`;
                repoLanguage.classList.add('repo-language');
            
                repoLanguageWrapper.appendChild(repoLanguage); 
                listItem.appendChild(repoLanguageWrapper);
            }

            reposList.appendChild(listItem);
        });

        resultDiv.innerHTML += `<p class="repo-heading">Repositories for ${username} </p>`;
        resultDiv.appendChild(reposList);
    }
}

function displayPaginationButtons(username, totalRepositories) {
    var resultDiv = document.getElementById('result');
    var paginationDiv = document.createElement('div');
    paginationDiv.classList.add('pagination-container');

   
    var totalPages = Math.ceil(totalRepositories / repositoriesPerPage);

   
    for (var i = 1; i <= totalPages; i++) {
        var pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-button'); 
        pageButton.onclick = function () {
            currentPage = parseInt(this.textContent, 10);
            fetchUserRepos(username);
        };
        paginationDiv.appendChild(pageButton);
    }

    resultDiv.appendChild(paginationDiv);
}
