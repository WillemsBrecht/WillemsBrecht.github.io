let email = {};
let joinButton;


const isValidEmailAddress = function(emailAddress) {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
 };

 const isEmpty = function(emailAddress){
    return !emailAddress || !emailAddress.length;
 }

const addErrorMessageToEmailLabel = function(labelField, errorField, errorMessage){
    labelField.classList.add("c-error");
    errorField.innerHTML = errorMessage;
}

const removeErrorMessageFromEmailLabel = function(labelField, errorField){
    labelField.classList.remove("c-error");
    errorField.innerHTML = "";
}

const doubleCheckEmailAddress = function(){
    if (!isEmpty(email.input.value) && isValidEmailAddress(email.input.value)){
        removeErrorMessageFromEmailLabel(email.field, email.error);
        email.input.removeEventListener('input', doubleCheckEmailAddress);
    } else {
        addErrorMessageToEmailLabel(email.field, email.error, "The e-mail is incorrect");
    }
}

const getFields = function(){
    joinButton = document.querySelector(".js-button-field");
    email.label = document.querySelector(".js-email-label");
    email.input = document.querySelector(".js-email-input");
    email.error = document.querySelector(".js-email-error");
    email.field = document.querySelector(".js-email-field");
}

const checkForPreferredScheme = function(){
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
        document.querySelector(".js-image").src = "../img/img_dark_mode.png";
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM is loaded!");
    checkForPreferredScheme();
    getFields();
    email.input.addEventListener("blur", function(){
        if(!isValidEmailAddress(email.input.value) && isEmpty(email.input.value)){
            addErrorMessageToEmailLabel(email.field, email.error, "This field is required!");
            email.input.addEventListener("input", doubleCheckEmailAddress);
        } else {
            if(isEmpty(email.input.value)){
                removeErrorMessageFromEmailLabel(email.field, email.error);
                email.input.removeEventListener('input', doubleCheckEmailAddress);
            }
        }
    });
    joinButton.addEventListener("click", function(event){
        event.preventDefault();
        if(isValidEmailAddress(email.input.value) && !isEmpty(email.input.value)){
            console.log("GOOD");
            removeErrorMessageFromEmailLabel(email.field, email.error);
            form = document.querySelector(".js-form");
            form.submit();
        } else {
            console.log("BAD");
            addErrorMessageToEmailLabel(email.field, email.error, "This field is required!");
        }
    });
});