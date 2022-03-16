const BASE_URL = 'http://localhost:8000/';

const options = {
    headers: {
        Accept: "application/json"
    }
};








const postBookmarkButton = document.getElementById("post-bookmark-button");

const userPostBookmarks = document.getElementById("user-post-bookmarks");
if (userPostBookmarks)
    userPostBookmarks.style.display = "none";








//const BASE_URL = 'http://localhost:8000/';

const addTodo = async () => {
    if (postBookmarkButton.getAttribute("state") == "bookmarked") {
        //fetch(url)
        fetch(BASE_URL + `post/${(postBookmarkButton.getAttribute("post-id"))}/unbookmark`, options)
            .then(response => response.json())
            .then(
                document.getElementById("post-bookmark-button").innerHTML = "Bookmark Post",
                postBookmarkButton.setAttribute("state", "unbookmarked")
            );
    }
    else if (postBookmarkButton.getAttribute("state") == "unbookmarked") {
        fetch(BASE_URL + `post/${(postBookmarkButton.getAttribute("post-id"))}/bookmark`, options)
            .then(response => response.json())
            .then(
                document.getElementById("post-bookmark-button").innerHTML = "Unbookmark Post",
                postBookmarkButton.setAttribute("state", "bookmarked")
            );
    }

}
if (postBookmarkButton) {
    postBookmarkButton.addEventListener('click', async () => {
        await addTodo();
    });
}

const commentBookmarkButton = document.getElementById("comment-bookmark-button");
//let va1= commentBookmarkButton.getAttribute("comment-id");
//let url1=BASE_URL + `comment/${va1}/bookmark`;
const addTodo1 = async () => {
    //fetch(url1)
    if (commentBookmarkButton.getAttribute("state") == "bookmarked") {
        fetch(BASE_URL + `comment/${(commentBookmarkButton.getAttribute("comment-id"))}/unbookmark`, options)
            .then(response => response.json())
            .then(
                document.getElementById("comment-bookmark-button").innerHTML = "Bookmark Comment",
                commentBookmarkButton.setAttribute("state", "unbookmarked")
            );
    }
    else if (commentBookmarkButton.getAttribute("state") == "unbookmarked") {
        fetch(BASE_URL + `comment/${(commentBookmarkButton.getAttribute("comment-id"))}/bookmark`, options)
            .then(response => response.json())
            .then(
                document.getElementById("comment-bookmark-button").innerHTML = "Unbookmark Comment",
                commentBookmarkButton.setAttribute("state", "bookmarked")
            );
    }
}
//commentBookmarkButton.addEventListener('click', async () => {
//   await addTodo1();
//});



if (commentBookmarkButton) {
    commentBookmarkButton.addEventListener('click', async () => {
        await addTodo1();
    });
}
/*
const addTodoshowUserPostBookmark = async () => {
    //fetch(url1)
    fetch(BASE_URL + `user/${(showUserPostBookmarksButton.getAttribute("user-id"))}/postbookmarks`)
        .then(response => response.json())

        .then(responseJsonAsJSObject=>{
            let posts =  responseJsonAsJSObject;
            userPostBookmarks.style.display = "block";
            userPostBookmarks.tbody.tr.innerHTML=   posts.post[0].title;
            // commentBookmarkButton.getAttribute("state")="unbookmarked"
        })
    }

    */





const addTodopostUpvoteButton = () => {
    if (postVotes.getAttribute("voteState") == "Up") {
        fetch(BASE_URL + `post/${(postUpvoteButton.getAttribute("post-id"))}/unvote`, options)
            .then(response => response.json())
            .then(
                postVotes.innerHTML--,
                postVotes.setAttribute("voteState", "un")
            );
    } else if (postVotes.getAttribute("voteState") == "un") {


        fetch(BASE_URL + `post/${(postUpvoteButton.getAttribute("post-id"))}/upvote`, options)
            .then(response => response.json())
            .then(
                postVotes.innerHTML++,
                postVotes.setAttribute("voteState", "Up")
            );
    } else if (postVotes.getAttribute("voteState") == "Down") {


        fetch(BASE_URL + `post/${(postUpvoteButton.getAttribute("post-id"))}/upvote`, options)
            .then(response => response.json())
            .then(
                postVotes.innerHTML++,
                postVotes.innerHTML++,
                postVotes.setAttribute("voteState", "Up")
            );
    }
}
const postUpvoteButton = document.getElementById("post-upvote-button");
const postVotes = document.getElementById("post-votes");

if (postUpvoteButton) {
    postUpvoteButton.addEventListener('click', () => {
        addTodopostUpvoteButton();
    });
}

const addTodopostDownvoteButton = async () => {
    if (postVotes.getAttribute("voteState") == "Down") {
        fetch(BASE_URL + `post/${(postDownvoteButton.getAttribute("post-id"))}/unvote`, options)
            .then(response => response.json())
            .then(
                postVotes.innerHTML++,
                postVotes.setAttribute("voteState", "un")
            );
    } else if (postVotes.getAttribute("voteState") == "un") {

        fetch(BASE_URL + `post/${(postDownvoteButton.getAttribute("post-id"))}/downvote`, options)
            .then(response => response.json())
            .then(
                postVotes.innerHTML--,
                postVotes.setAttribute("voteState", "Down")
            );
    } else if (postVotes.getAttribute("voteState") == "Up") {

        fetch(BASE_URL + `post/${(postDownvoteButton.getAttribute("post-id"))}/downvote`, options)
            .then(response => response.json())
            .then(
                postVotes.innerHTML--,
                postVotes.innerHTML--,
                postVotes.setAttribute("voteState", "Down")
            );
    }
}
const postDownvoteButton = document.getElementById("post-downvote-button");
//const postVotes = document.getElementById("post-votes");

if (postDownvoteButton) {
    postDownvoteButton.addEventListener('click', async () => {
        await addTodopostDownvoteButton();
    });
}





const addTodoshowUserPostVotesButton = async () => {
    //fetch(url1)
    fetch(BASE_URL + `user/${(showUserPostVotesButton.getAttribute("user-id"))}/postvotes`, options)
        .then(response => response.json())
        .then(
            userPostVotes.style.display = "block",
            // commentBookmarkButton.getAttribute("state")="unbookmarked"
        );
}
const showUserPostVotesButton = document.getElementById("show-user-post-votes-button");
const userPostVotes = document.getElementById("user-post-votes");
if (userPostVotes)
    userPostVotes.style.display = "none";

if (showUserPostVotesButton) {
    showUserPostVotesButton.addEventListener('click', async () => {
        await addTodoshowUserPostVotesButton();
    });
}



const addTodocommentUpvoteButton = async () => {
    if (commentVotes.getAttribute("voteState") == "Up") {
        fetch(BASE_URL + `comment/${(commentUpvoteButton.getAttribute("comment-id"))}/unvote`, options)
            .then(response => response.json())
            .then(
                commentVotes.innerHTML--,
                commentVotes.setAttribute("voteState", "un")
            );
    } else if (commentVotes.getAttribute("voteState") == "un") {


        fetch(BASE_URL + `comment/${(commentUpvoteButton.getAttribute("comment-id"))}/upvote`, options)
            .then(response => response.json())
            .then(
                commentVotes.innerHTML++,
                commentVotes.setAttribute("voteState", "Up")
            );
    } else if (commentVotes.getAttribute("voteState") == "Down") {


        fetch(BASE_URL + `comment/${(commentUpvoteButton.getAttribute("comment-id"))}/upvote`, options)
            .then(response => response.json())
            .then(
                commentVotes.innerHTML++,
                commentVotes.innerHTML++,
                commentVotes.setAttribute("voteState", "Up")
            );
    }
}
const commentUpvoteButton = document.getElementById("comment-upvote-button");
const commentVotes = document.getElementById("comment-votes");

if (commentUpvoteButton) {
    commentUpvoteButton.addEventListener('click', async () => {
        await addTodocommentUpvoteButton();
    });
}

const addTodocommentDownvoteButton = async () => {
    if (commentVotes.getAttribute("voteState") == "Down") {
        fetch(BASE_URL + `comment/${(commentUpvoteButton.getAttribute("comment-id"))}/unvote`, options)
            .then(response => response.json())
            .then(
                commentVotes.innerHTML++,
                commentVotes.setAttribute("voteState", "un")
            );
    } else if (commentVotes.getAttribute("voteState") == "un") {

        fetch(BASE_URL + `comment/${(commentUpvoteButton.getAttribute("comment-id"))}/downvote`, options)
            .then(response => response.json())
            .then(
                commentVotes.innerHTML--,
                commentVotes.setAttribute("voteState", "Down")
            );
    } else if (commentVotes.getAttribute("voteState") == "Up") {

        fetch(BASE_URL + `comment/${(commentUpvoteButton.getAttribute("comment-id"))}/downvote`, options)
            .then(response => response.json())
            .then(
                commentVotes.innerHTML--,
                commentVotes.innerHTML--,
                commentVotes.setAttribute("voteState", "Down")
            );
    }
}
const commentDownvoteButton = document.getElementById("comment-downvote-button");
//const postVotes = document.getElementById("post-votes");

if (commentDownvoteButton) {
    commentDownvoteButton.addEventListener('click', async () => {
        await addTodocommentDownvoteButton();
    });
}
const addTodoshowUserCommentVotesButton = async () => {
    //fetch(url1)
    fetch(BASE_URL + `user/${(showUserCommentVotesButton.getAttribute("user-id"))}/postvotes`, options)
        .then(response => response.json())
        .then(
            userCommentVotes.style.display = "block",
            // commentBookmarkButton.getAttribute("state")="unbookmarked"
        );
}
const showUserCommentVotesButton = document.getElementById("show-user-comment-votes-button");
const userCommentVotes = document.getElementById("user-comment-votes");
if (userCommentVotes)
    userCommentVotes.style.display = "none";

if (showUserCommentVotesButton) {
    showUserCommentVotesButton.addEventListener('click', async () => {
        await addTodoshowUserCommentVotesButton();
    });
}


const addTodoshowUserPostsButton = async () => {
    //fetch(url1)
    fetch(BASE_URL + `user/${(showUserPostsButton.getAttribute("user-id"))}/posts`, options)
        .then(response => response.json())
        .then(
            userposts.style.display = "block",
            // commentBookmarkButton.getAttribute("state")="unbookmarked"
        );
}
const showUserPostsButton = document.getElementById("show-user-posts-button");
const userposts = document.getElementById("user-posts");
if (userposts)
    userposts.style.display = "none";

if (showUserPostsButton) {
    showUserPostsButton.addEventListener('click', async () => {
        await addTodoshowUserPostsButton();
    });
}

const addTodoshowUserCommentsButton = async () => {
    //fetch(url1)
    fetch(BASE_URL + `user/${(showUserCommentsButton.getAttribute("user-id"))}/comments"`, options)
        .then(response => response.json())
        .then(
            usercomments.style.display = "block",
            // commentBookmarkButton.getAttribute("state")="unbookmarked"
        );
}
const showUserCommentsButton = document.getElementById("show-user-comments-button");
const usercomments = document.getElementById("user-comments");
if (usercomments)
    usercomments.style.display = "none";

if (showUserCommentsButton) {
    showUserCommentsButton.addEventListener('click', async () => {
        await addTodoshowUserCommentsButton();
    });
}















const showUserPostBookmarksButton = document.getElementById("show-user-post-bookmarks-button");
const addTodoshowUserPostBookmark = async (data) => {
    await fetch(BASE_URL + `user/${(showUserPostBookmarksButton.getAttribute("user-id"))}/postbookmarks`, options)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            userPostBookmarks.style.display = "block";
            // var tbody=document.createElement('tbody');
            //  var table=document.getElementById('user-post-bookmarks');

            // table.appendChild(tbody);
            // if(data.payload.length!=0){
            //  for(var i=0;i<data.payload.length;i++ ){
            // var tr=document.createElement('tr');
            //  tbody.appendChild(tr);
            // tr.innerText=data.payload[i].title;
            //   document.getElementById('title').innerText=data.payload[i].title;
            //  document.getElementById('createdAt').innerText=data.payload[i].createdAt;
            // document.getElementById('username').innerText=data.payload[i].user.username;
            //  var tr2=document.createElement('tr');
            //  tbody.appendChild(tr2);
            //  tr2.innerText=data.payload[i].createdAt;

            //  var tr3=document.createElement('tr');
            //  tbody.appendChild(tr3);
            //   tr3.innerText=data.payload[i].user.username;
            //  var td1=document.createElement('td');
            //   tr.appendChild(td1);
            //   td1.innerText=data.payload[i].title;
            //    var td2=document.createElement('td');
            //    tr.appendChild(td2);
            //    td2.innerText=data.payload[i].createdAt;
            //   var td3=document.createElement('td');
            //  tr.appendChild(td3);
            //  td3.innerText=data.payload[i].user.username;
            //}
        })
        //})
        .catch(function (error) {
            // If there is any error you will catch them here. 
            console.error(error);
        });


}

if (showUserPostBookmarksButton) {
    showUserPostBookmarksButton.addEventListener('click', async (data) => {
        await addTodoshowUserPostBookmark();
    });
}





const showUserCommentBookmarksButton = document.getElementById("show-user-comment-bookmarks-button");

const userCommentBookmarks = document.getElementById("user-comment-bookmarks");
if (userCommentBookmarks)
    userCommentBookmarks.style.display = "none";


const addTodoshowUserCommentBookmarks = async () => {
    //fetch(url1)
    fetch(BASE_URL + `user/${(showUserCommentBookmarksButton.getAttribute("user-id"))}/commentbookmarks`, options)
        .then(response => response.json())
        .then(
            userCommentBookmarks.style.display = "block",
            // commentBookmarkButton.getAttribute("state")="unbookmarked"
        );
}
if (showUserCommentBookmarksButton) {
    showUserCommentBookmarksButton.addEventListener('click', async () => {
        await addTodoshowUserCommentBookmarks();
    });
}