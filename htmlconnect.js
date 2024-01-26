/*include JS files*/
include("main.js");



var sb = new SendBird();

//identify the user
//USER_ID = 

sb.connect(USER_ID,function(user,error){
    if (error){
        return;
    }
});

//if there is any existing account
//sb.connect(USER_ID, ACCESS_TOKEN, function(user, error) {});

