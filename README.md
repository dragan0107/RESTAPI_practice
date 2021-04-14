# RESTAPI_practice
RESTAPI practice made with node and express, refactored version.

very simple schema has been used which looks like this:
{
    title: "....",
    content: "...."
}

Functionality: 

"/articles" route:

GET request: returns all the articles from the database;
POST request: adds a new article to the database,
DELETE request: deletes ALL the articles from the database!!!

"/articles/articleTitle" route: 

GET: gets a specific article by the given title,
PUT: put request overwrites the article with the properties that are sent by the given title,
PATCH: updates the article by the given title,
DELETE: deletes an article by the given title


How to start and test: 
1: fork the copy and run "npm install" on your machine;
2: run "npm start" in the terminal
