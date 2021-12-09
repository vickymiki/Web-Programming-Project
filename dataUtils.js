const { ObjectId } = require('mongodb');

function toObjectId(id) {
    if(!id)     throw `Id not provided`;
    if(id instanceof ObjectId) {
        return id;
    }
    if(!isStringParam(id)) {
        throw `${id} is not a string`;
    }
    try {
        return new ObjectId(id);
    } catch(e) {
        throw "Invalid Id";
    }
}

function isValidName(name) {
    if(name.length !== 0 && name.trim().length === 0) 
        throw "Invalid username only with empty spaces";

    var letterRegex = /^[a-zA-Z0-9_]{4,}$/;
    const valid = letterRegex.test(name);
    if(!valid) {
        throw `${name} is not valid for a username, minimum 4 characters!`;
    }
}

function isValidZip(zip) {
    if(typeof zip !== 'string') {
        throw "zip number must be a string";
    }

    var zipRegex = /^[0-9]{5}$/;
    const valid = zipRegex.test(zip);
    if(!valid) {
        throw `${zip} is not valid for zip`;
    }
}

function isValidEmail(email) {
    if(typeof email !== 'string') {
        throw "email must be a string";
    }

    var emailRegex = /[a-zA-Z0-9_]{6,}@[a-z0-9]{2,}\.com$/;
    const valid = emailRegex.test(email);
    if(!valid) {
        throw `${email} is not vlaid for email`;
    }
}

function isValidPhone(phone) {
    if(typeof phone !== 'string') {
        throw 'phone number must be a string';
    }

    var phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    const valid = phoneRegex.test(phone);
    if(!valid) {
        throw 'phone number not valid';
    }
}

function isValidReviewFeedback(feedback) {
    if(typeof feedback !== 'object') {
        throw `review_feedback is not an object`;
    }

    let attributes = ['likes', 'dislikes'];
    for(let attribute in feedback) {
        if(attributes.indexOf(attribute) === -1) {
            throw `${attribute} should not be in review_feedback`;
        } else {
            if(!isArrayOfStr(feedback[attribute])) {
                throw `${attribute} is not an array of string`;
            }
        }
    }
    return true;
}

function isValidPassword(password) {
    if(typeof password !== 'string') {
        throw 'password must be a string';
    }

    var pwdRegex = /\S{8,}$/;
    const valid = pwdRegex.test(password);
    if(!valid) {
        throw 'password not valid';
    }
}
function isStringParam(param){
    if(typeof param !== 'string') {
        return false;
    } 
    if(param.trim() === '') {
        throw "empty spaces string";
    }
    return true;
}

function isArrayOfStr(param) {
    if(param instanceof Array) {
        for(let key of param) {
            if(typeof key !== 'string') {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

function isFieldExistChecker(param, paramName) {
    if(!param || param === undefined) {
        throw `You must provide ${paramName}`;
    }
}

function userFieldChecker(params, update = false) {
    let allParams = ['streetAddress', 'city', 'state', 'zip', 
    'email', 'phone'];
    if(!update) {
        // check whether all params exist or not
        allParams.push('userName');
        allParams.push('password');
    }
    
    for(let key of allParams) {
        isFieldExistChecker(params[key], key);
    }

    // validate string params
    let address = ['streetAddress', 'city', 'state'];
    for(let key of address) {
        if(!isStringParam(params[key])) {
            throw `The type of ${key} is not a string`;
        }
    }

    isValidZip(params.zip);
    isValidEmail(params.email);
    isValidPhone(params.phone);
    if(!update) { 
        isValidName(params.userName);
        isValidPassword(params.password);
    }
}

function managerFieldChecker(params) {
    let allParams = ['userName', 'password'];  
    
    for(let key of allParams) {
        isFieldExistChecker(params[key], key);
    }
    
    isValidName(params.userName);
    isValidPassword(params.password);
}

//Returns ObjectId if given id is already an ObjectId or a valid string of ObjectId, otherwise throws
function validateObjectId(id){
    if( typeof id !== 'string' && !ObjectId.isValid(id) ) throw `id must be of type string or ObjectId: ${id}`
    if( typeof id === 'string' && id.length === id.split(' ').length - 1) throw `id as string must not be empty: ${id}`
    if( typeof id === 'string' ){
        try{
            id = ObjectId(id)    
        }catch(e){
            throw `Provided id not a valid ObjectId: ${id}`
        }
    }
    return id
}

module.exports = {
    toObjectId,
    isValidName,
    isValidZip,
    isValidEmail,
    isValidPhone,
    isValidPassword, 
    isValidReviewFeedback,
    isStringParam,
    isArrayOfStr,
    isFieldExistChecker,
    userFieldChecker,
    managerFieldChecker,
    validateObjectId
}
