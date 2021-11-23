const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const reviews = mongoCollections.reviews;
const users = mongoCollections.users;
const managers = mongoCollections.managers;

//Function to check if input is only spaces 
const isSpaces = function isSpaces(input) {
  let spaces = true;
  const arr = input.split('');
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].charCodeAt(0) !== 32) {
      spaces = false;
      break; //can break here since at least one non space is found
    }
  }
  return spaces;
}

const validId = function validId(id) {
  if (id.length != 24) return false;
  for (let i = 0; i < id.length; i++) {
    let code = id.charCodeAt(i);
    if ((code < 48) ||  //check if not valid id
      ((code > 57) && (code < 65)) ||  //valid number if in range 48-57
      ((code > 70) && (code < 97)) ||  //valid letter if 65-70 or 97-102
      (code > 102)) {
      return false;
    } 
  }
  return true;
}

async function create(reviewId, userId, reply, isManager) {
  //Error checking
  if (!reviewId || reviewId == null) throw 'All fields need to have valid values';
  if (!userId || userId == null) throw 'All fields need to have valid values';
  if (!reply || reply == null) throw 'All fields need to have valid values';
  if (isManager == null) throw 'All fields need to have valid values';
  //More error checking
  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (typeof userId !== 'string') throw 'User id must be a string';
  if (typeof reply !== 'string') throw 'Reply must be a string';
  if (typeof isManager !== 'boolean') throw 'Manager status must be a boolean value';
  
  if (!validId(reviewId)) throw 'Review Id must be a string of 24 hex characters';
  if (!validId(userId)) throw 'User Id must be a string of 24 hex characters';
  if (isSpaces(reply)) throw 'Reply can not be only spaces';

  const date = new Date();
  const newId = new ObjectId();

  //Create the new review
  const newReply = {
    _id: newId,
    userId: userId,
    reply: reply,
    date: date,
    isManager: isManager
  };

  const reviewCollection = await reviews();

  const updateInfo = await reviewCollection.updateOne({ _id: ObjectId(reviewId) }, { $push: { replies: newReply } });
  if (updateInfo.modifiedCount == 0) throw "Could not add reply";

  if (isManager) {
    const managerCollection = await managers();
    const updateManager = await managerCollection.updateOne({ _id: ObjectId(userId) }, { $push: { reply_id: newId } });
    if (updateManager.modifiedCount == 0) throw "Could not update managers";
  } else {
    const userCollection = await users();
    const updateUser = await userCollection.updateOne({ _id: ObjectId(userId) }, { $push: { reply_id: newId } });
    if (updateUser.modifiedCount == 0) throw "Could not update users";
  }
    
  return { addedReply: true };
}

async function remove(reviewId, replyId) {
  if (!reviewId || reviewId == null) throw 'All fields need to have valid values';
  if (!replyId || replyId == null) throw 'All fields need to have valid values';

  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (typeof replyId !== 'string') throw 'Reply id must be a string';

  if (!validId(reviewId)) throw 'Review Id must be a string of 24 hex characters';
  if (!validId(replyId)) throw 'Reply Id must be a string of 24 hex characters';

  const reviewCollection = await reviews();

  const target = await reviewCollection.findOne({ _id: ObjectId(reviewId) });
  if (!target) throw "No review exists with that id";

  const myReplies = target.replies;
  let user_id = null;
  let managerStatus = null;
  
  for (let i = 0; i < myReplies.length; i++) {
    if (String(myReplies[i]._id) == String(replyId)) {
      user_id = myReplies[i].userId;
      managerStatus = myReplies[i].isManager;
    }
  }

  const updateInfo = await reviewCollection.updateOne({_id: ObjectId(reviewId)}, { $pull: { replies: { _id: ObjectId(replyId) } } });
  if (updateInfo.modifiedCount == 0) throw "Could not remove reply with that id";

  if (managerStatus) {
    const managerCollection = await managers();
    const updateManager = await managerCollection.updateOne({_id: ObjectId(user_id)}, { $pull: { reply_id: ObjectId(replyId) } });
    if (updateManager.modifiedCount == 0) throw "Could not remove reply from managers";
  } else {
    const userCollection = await users();
    const updateUser = await userCollection.updateOne({_id: ObjectId(user_id)}, { $pull: { reply_id: ObjectId(replyId) } });
    if (updateUser.modifiedCount == 0) throw "Could not remove reply from users";
  }

  return { deletedReply: true };
}

async function getAllByUser(userId, isManager) {
  if (!userId || userId == null) throw 'Must provide a user id';
  if (isManager == null) throw 'Must provide a user id';
  if (typeof userId !== 'string') throw 'user id must be a string';
  if (typeof isManager !== 'boolean') throw 'user id must be a string';
  if (!validId(userId)) throw "user Id must be a string of 24 hex characters";

  const userReplies = [];
  let replyIds = [];

  if (isManager) {
    //First get that manager object
    const managerCollection = await managers();
    const manager = await managerCollection.findOne(ObjectId(userId));
    //Now pull the review ids
    replyIds = manager.reply_id;
    if (replyIds.length == 0) throw "No replies found for manager";
  }
  else {
    //First get that user object
    const userCollection = await users()
    const user = await userCollection.findOne(ObjectId(userId));
    //Now pull the review ids
    replyIds = user.reply_id;
    if (replyIds.length == 0) throw "No replies found for user";
  }

  //Pull all the reviews
  const reviewsCollection = await reviews();
  const myReviews = await reviewsCollection.find({}, { _id: 1, restaurant_id: 1 }).toArray();

  if (myReviews.length == 0) throw 'No reviews found'; //Redundant, but good practice

  replyIds.forEach(id => {
    for (let i = 0; i < myReviews.length; i++) {
      for (let j = 0; j < (myReviews[i].replies).length; j++) {
        if (String(id) == String((myReviews[i].replies[j])._id)) {
          userReplies.push(myReviews[i].replies[j]);
          break; //We can stop since we found that particular id - move onto the next one
        }
      }
    }
  });

  if (userReplies.length == 0) throw "Something went wrong";
  return userReplies;  
}

module.exports = {
  create,
  remove,
  getAllByUser
};