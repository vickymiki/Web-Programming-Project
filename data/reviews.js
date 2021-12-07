const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const reviews = mongoCollections.reviews;
const users = mongoCollections.users;
const managers = mongoCollections.managers;
const restaurants = mongoCollections.restaurants;
const repliesData = require('./replies');

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

//Create an original review 
async function create(restaurantId, userId, review, rating, isManager, imgname) {
  //Error checking
  if (!restaurantId || restaurantId == null) throw 'All fields need to have valid values';
  if (!userId || userId == null) throw 'All fields need to have valid values';
  if (!review || review == null) throw 'All fields need to have valid values';
  if (!rating || rating == null) throw 'All fields need to have valid values';
  if (isManager == null) throw 'All fields need to have valid values';
  if(!imgname || imgname == null) throw 'All fields need to have valid values'
  //More error checking
  if (typeof restaurantId !== 'string') throw 'Restaurant id must be a string';
  if (typeof userId !== 'string') throw 'User id must be a string';
  if (typeof review !== 'string') throw 'Review must be a string';
  if (typeof rating !== 'number') throw 'Rating must be a number';
  if (typeof isManager !== 'boolean') throw 'isManager status must be a boolean value';
  if (typeof imgname !== 'string') throw 'Image name must be a string';
  
  //More error checking
  if (isSpaces(review)) throw 'Reviewer can not be only spaces';
  if (isSpaces(imgname)) throw 'Image name can not be only spaces';
  if (rating > 5 || rating < 1) throw 'Rating must be in the range [1-5]';
  //Check for valid ID's
  if (!validId(restaurantId)) throw "Restaurant Id must be a string of 24 hex characters";
  if (!validId(userId)) throw "User Id must be a string of 24 hex characters";

  const likes = 0;
  const dislikes = 0;
  const replies = [];
  const date = new Date();
  //Format date 
  const month = date.getMonth() + 1; //indexes from 0
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = `0${minutes}`;
  let period = "AM";
  if (hours > 12) {
    hours -= 12;
    period = "PM";
  }
  if (hours == 0) hours = 12;
  const timestamp = `${month}/${day}/${year} ${hours}:${minutes} ${period}`;
  //Pull userName
  let myUser = null;
  if (isManager) {
    const managerCollection = await managers();
    myUser = await managerCollection.findOne({ _id: ObjectId(userId) });
    if (!myUser) throw 'User not found';
  } else {
    const userCollection = await users();
    myUser = await userCollection.findOne({ _id: ObjectId(userId) });
    if (!myUser) throw 'User not found';
  }

  //TODO
  //here we are going to first upload the photo it its own collection - photos, and then store its id as "photoId" in the reviews collection


  const userName = myUser.userName;

  const reviewsCollection = await reviews();

  //Create the new review
  const newReview = {
    restaurantId: restaurantId,
    userId: userId,
    userName: userName,
    review: review,
    rating: rating,
    likes: likes,
    isManager: isManager, //We can use this paramater to display manager reviews differently
    dislikes: dislikes,
    replies: replies,
    date: timestamp,
    imageName: imgname
  };

  //Add review to the correct restaurant
  const insertInfo = await reviewsCollection.insertOne(newReview);
  if (insertInfo.insertedCount === 0) throw "Could not add new review";
  const newId = insertInfo.insertedId;

  //Add the new reviewId to the restaunt reviews array
  const restaurantCollection = await restaurants();
  const updateInfo = await restaurantCollection.updateOne({ _id: ObjectId(restaurantId) }, { $addToSet: { reviews: newId } });
  if (updateInfo.modifiedCount === 0) throw "Could not update restaurant collection";

  //Check if this was by a manager or regular user. Update the correct collection
  if (isManager) {
    //Add the new reviewId to the manager review_id array
    const managerCollection = await managers();
    await managerCollection.updateOne({ _id: ObjectId(userId) }, { $addToSet: { review_id: newId } });
  }
  else {
    //Add the new reviewId to the user review_id array
    const userCollection = await users();
    await userCollection.updateOne({ _id: ObjectId(userId) }, { $addToSet: { review_id: newId } });
  }

  //Now update the new rating average for that restaurant
  const myRestaurant = await restaurantCollection.findOne(ObjectId(restaurantId));
  const allReviews = myRestaurant.reviews;

  let sum = 0;
  let count = 0;
  for (let i = 0; i < allReviews.length; i++){
    let itemReview = await reviewsCollection.findOne(ObjectId(allReviews[i]));
    sum += itemReview.rating;
    count += 1;
  };

  let avg = sum / count;
  avg = Math.round(100 * avg)/100;
  await restaurantCollection.updateOne({ _id: ObjectId(restaurantId) }, { $set: { rating: avg }});

  return { addedReview: true };
}

//Function returns all review objects in the database as an array
async function getAll() {
  const reviewCollection = await reviews();

  return await reviewCollection.find({}, { _id: 1, restaurant_id: 1 }).toArray();
}

//Function to return array of all reviews from a particular restaurant
//This will be needed when displaying all restaurants
async function getAllByRestaurant(restaurantId) {
  if (!restaurantId || restaurantId == null) throw 'Must provide a restaurant id';
  if (typeof restaurantId !== 'string') throw 'Restaurant id must be a string';
  if (isSpaces(restaurantId)) throw 'Restaurant name id can not be only spaces';
  if (!validId(restaurantId)) throw "Restaurant Id must be a string of 24 hex characters";

  //First get that restaurant object
  const restaurantCollection = await restaurants();
  const restaurant = await restaurantCollection.findOne(ObjectId(restaurantId));
  //const restaurant = await restaurantFuncs.get(restaurantId);
  //Now pull the review ids
  const reviewIds = restaurant.reviews;
  if (reviewIds.length == 0) return [];

  const restaurantReviews = [];

  const myReviews = await this.getAll();
  if (myReviews.length == 0) throw 'Internal error'; //Redundant, but good practice

  reviewIds.forEach(id => {
    for (let i = 0; i < myReviews.length; i++) {
      if (String(id) == String(myReviews[i]._id)) {
        restaurantReviews.push(myReviews[i]);
        break; //We can stop since we found that particular id - move onto the next one
      }
    }
  });

  if (restaurantReviews.length == 0) throw 'Something went wrong'; //This really should never be triggered
  return restaurantReviews;
}

//Function to return array of all reviews from a particular user
//If we want managers to also comment, we will need to add an argument here like this:
// getAllByUser(userId, isManager), where isManager would be a boolean value. 
// We would have to check cookies to determine if user is mnager or not, then search the correct collection (users/managers)
// Would also need to add reviews array to managers collection 
//This will be needed when we display a user profile page 
async function getAllByUser(userId, isManager) {
  if (!userId || userId == null) throw 'Must provide a user id';
  if (isManager == null) throw 'Must provide a user id';
  if (typeof userId !== 'string') throw 'user id must be a string';
  if (typeof isManager !== 'boolean') throw 'user id must be a string';
  if (isSpaces(userId)) throw 'user id can not be only spaces';
  if (!validId(userId)) throw "user Id must be a string of 24 hex characters";

  const userReviews = [];
  let reviewIds = [];

  if (isManager) {
    //First get that manager object
    const managerCollection = await managers();
    const manager = await managerCollection.findOne(ObjectId(userId));
    //onst manager = await managerFuncs.get(userId);
    //Now pull the review ids
    reviewIds = manager.review_id;
    if (reviewIds.length == 0) throw "No reviews found for manager";
  }
  else {
    //First get that user object
    const userCollection = await users()
    const user = await userCollection.findOne(ObjectId(userId));
    //const user = await userFuncs.get(userId);
    //Now pull the review ids
    reviewIds = user.review_id;
    if (reviewIds.length == 0) throw "No reviews found for user";
  }


  //Pull all the reviews
  const myReviews = await this.getAll();
  if (myReviews.length == 0) throw 'No reviews found'; //Redundant, but good practice

  reviewIds.forEach(id => {
    for (let i = 0; i < myReviews.length; i++) {
      if (String(id) == String(myReviews[i]._id)) {
        userReviews.push(myReviews[i]);
        break; //We can stop since we found that particular id - move onto the next one
      }
    }
  });

  if (userReviews.length == 0) throw 'Something went wrong'; //This really should never be triggered
  return userReviews;
}

async function remove(reviewId) {
  if (!reviewId || reviewId == null) throw 'Must provide a review id';
  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (isSpaces(reviewId)) throw 'Review id can not be only spaces';
  if (!validId(reviewId)) throw "Review Id must be a string of 24 hex characters";

  //TODO will need to remove photo from photo collection once thats done

  const reviewCollection = await reviews();

  //First find that review
  const target = await reviewCollection.findOne(ObjectId(reviewId));
  if (!target) {
    throw "That review doesn't exist";
  }
  //pull the needed info 
  const restaurant_id = target.restaurantId;
  const user_id = target.userId;
  const managerStatus = target.isManager;
  let replies = target.replies;

  //Check if there are replies and delete those first 
  if (replies.length !== 0) {
    for(let i = 0; i < replies.length; i++){
      let replyId = replies[i]._id.toString();
      let deletion = await repliesData.remove(reviewId, replyId);
      if (!deletion.deletedReply) throw 'Could not reomve a reply - can not remove revew';
    }
  }

  //Now delete review 
  const deletionInfo = await reviewCollection.deleteOne({ _id: ObjectId(reviewId) });

  if (deletionInfo.deletedCount == 0) {
    throw "Could not remove review";
  }

  //Now remove the id from the restaurant collection
  const restaurantCollection = await restaurants();
  await restaurantCollection.updateOne({ _id: ObjectId(restaurant_id) }, { $pull: { reviews: ObjectId(reviewId) } });

  const managerCollection = await managers();
  const userCollection = await users();
  //Now remove from either the user or manager collection as well
  if (managerStatus) {
    await managerCollection.updateOne({ _id: ObjectId(user_id) }, { $pull: { review_id: ObjectId(reviewId) } });
  } else {
    await userCollection.updateOne({ _id: ObjectId(user_id) }, { $pull: { review_id: ObjectId(reviewId) } });
  }

  //Now we need to go through likes/dislikes and remove reviewId if it exists
  await managerCollection.updateMany({}, { $pull: { 'review_feedback.likes': reviewId } });
  await managerCollection.updateMany({}, { $pull: { 'review_feedback.dislikes': reviewId } });
  await userCollection.updateMany({}, { $pull: { 'review_feedback.likes': reviewId } });
  await userCollection.updateMany({}, { $pull: { 'review_feedback.dislikes': reviewId } });

  //Now we also need to update the overall rating
  const myRestaurant = await restaurantCollection.findOne(ObjectId(restaurant_id));
  const allReviews = myRestaurant.reviews;

  let sum = 0;
  let count = 0;
  let avg = 0;
  for (let i = 0; i < allReviews.length; i++){
    let itemReview = await reviewCollection.findOne(ObjectId(allReviews[i]));
    sum += itemReview.rating;
    count += 1;
  };

  if (count !== 0) {
    avg = sum / count;
    avg = Math.round(100 * avg)/100;
  }
  await restaurantCollection.updateOne({ _id: ObjectId(restaurant_id) }, { $set: { rating: avg }});


  return { "reviewId": reviewId, "deleted": true };
}

//If we want to do this we will need to add an attribute to user for "feedback_Reviews" and "feedback_replies"
// these will be arrays, each of which store the ids of reviews/ replies that have been liked/dislike
// This way a user cannot like more than once, or like and dislike a post 
async function addLike(reviewId, user_id, managerStatus) {
  if (!reviewId || reviewId == null) throw 'Must provide a review id';
  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (isSpaces(reviewId)) throw 'Review id can not be only spaces';
  if (!validId(reviewId)) throw "Review Id must be a string of 24 hex characters";

  const reviewCollection = await reviews();

  //First find that review
  const target = await reviewCollection.findOne(ObjectId(reviewId));
  if (!target) {
    throw "That review doesn't exist";
  }
  
  //First check the user/manager's review_feedback to see if they already left feedback

  if (managerStatus) {
    const managerCollection = await managers();
    if (await managerCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.likes": reviewId } ) == 1) {
      throw "Manager has already liked review";
    }
    if (await managerCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.dislikes": reviewId }) == 1) {
      throw "Manager has already disliked review, can't simultaneously like";
    }
  } else {
    const userCollection = await users();
    if (await userCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.likes": reviewId }) == 1) {
      throw "User has already liked review";
    }
    if (await userCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.dislikes": reviewId }) == 1) {
      throw "User has already disliked review, can't simultaneously like";
    }
  }

  //Add one to the total likes of that review
  //const reviewCollection = await reviews();
  await reviewCollection.updateOne({ _id: ObjectId(reviewId) }, { $inc: { likes: 1 } });
  const action = await reviewCollection.findOne({ _id: ObjectId(reviewId) });

  //Add the reviewId to the users' review_feedback so they can't like it again or dislike
  if (managerStatus) {
    const managerCollection = await managers();
    await managerCollection.updateOne({ _id: ObjectId(user_id) }, { $push: { "review_feedback.likes": reviewId } });
  } else {
    const userCollection = await users();
    await userCollection.updateOne({ _id: ObjectId(user_id) }, { $push: { "review_feedback.likes": reviewId } } );
  }

  //return {"reviewId": reviewId, "liked": true}
  return action.likes;
}

async function addDislike(reviewId, user_id, managerStatus) {
  if (!reviewId || reviewId == null) throw 'Must provide a review id';
  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (isSpaces(reviewId)) throw 'Review id can not be only spaces';
  if (!validId(reviewId)) throw "Review Id must be a string of 24 hex characters";

  const reviewCollection = await reviews();

  //First find that review
  const target = await reviewCollection.findOne(ObjectId(reviewId));
  if (!target) {
    throw "That review doesn't exist";
  }
  
  //First check the user/manager's review_feedback to see if they already left feedback

  if (managerStatus) {
    const managerCollection = await managers();
    if (await managerCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.dislikes": reviewId } ) == 1) {
      throw "Manager has already disliked review";
    }
    if (await managerCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.likes": reviewId }) == 1) {
      throw "User has already liked review, can't simultaneously dislike";
    }
  } else {
    const userCollection = await users();
    if (await userCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.dislikes": reviewId } ) == 1) {
      throw "User has already disliked review";
    }
    if (await userCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.likes": reviewId }) == 1) {
      throw "User has already liked review, can't simultaneously dislike";
    }
  }

  //Add one to the total dislikes of that review
  //const reviewCollection = await reviews();
  await reviewCollection.updateOne({ _id: ObjectId(reviewId) }, { $inc: { dislikes: 1 } });
  const action = await reviewCollection.findOne({ _id: ObjectId(reviewId) });

  //Add the reviewId to the users' review_feedback so they can't like it again or dislike
  if (managerStatus) {
    const managerCollection = await managers();
    await managerCollection.updateOne({ _id: ObjectId(user_id) }, { $push: { "review_feedback.dislikes": reviewId } } );
  } else {
    const userCollection = await users();
    await userCollection.updateOne({ _id: ObjectId(user_id) }, { $push: { "review_feedback.dislikes": reviewId } } );
  }

  //return {"reviewId": reviewId, "disliked": true}
  return action.dislikes;
}

async function removeLike(reviewId, user_id, managerStatus) {
  if (!reviewId || reviewId == null) throw 'Must provide a review id';
  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (isSpaces(reviewId)) throw 'Review id can not be only spaces';
  if (!validId(reviewId)) throw "Review Id must be a string of 24 hex characters";

  const reviewCollection = await reviews();

  //First find that review
  const target = await reviewCollection.findOne(ObjectId(reviewId));
  if (!target) {
    throw "That review doesn't exist";
  }
  
  //First check the user/manager's review_feedback to see if they already left feedback

  if (managerStatus) {
    const managerCollection = await managers();
    if (await managerCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.likes": reviewId } ) == 0) {
      throw "Manager hasn't liked review yet";
    }
  } else {
    const userCollection = await users();
    if (await userCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.likes": reviewId } ) == 0) {
      throw "User hasn't liked review yet";
    }
  }

  //Remove one from the total dlikes of that review
  //const reviewCollection = await reviews();
  await reviewCollection.updateOne({ _id: ObjectId(reviewId) }, { $inc: { likes: -1 } });
  const action = await reviewCollection.findOne({ _id: ObjectId(reviewId) });

  //Remove the reviewId from the users' review_feedback so they can like it again or dislike
  if (managerStatus) {
    const managerCollection = await managers();
    await managerCollection.updateOne({ _id: ObjectId(user_id) }, { $pull: { "review_feedback.likes": reviewId } } );
  } else {
    const userCollection = await users();
    await userCollection.updateOne({ _id: ObjectId(user_id) }, { $pull: { "review_feedback.likes": reviewId } } );
  }

  //return {"reviewId": reviewId, "liked": false}
  return action.likes;
}

async function removeDislike(reviewId, user_id, managerStatus) {
  if (!reviewId || reviewId == null) throw 'Must provide a review id';
  if (typeof reviewId !== 'string') throw 'Review id must be a string';
  if (isSpaces(reviewId)) throw 'Review id can not be only spaces';
  if (!validId(reviewId)) throw "Review Id must be a string of 24 hex characters";

  const reviewCollection = await reviews();

  //First find that review
  const target = await reviewCollection.findOne(ObjectId(reviewId));
  if (!target) {
    throw "That review doesn't exist";
  }
  
  //First check the user/manager's review_feedback to see if they already left feedback

  if (managerStatus) {
    const managerCollection = await managers();
    if (await managerCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.dislikes": reviewId } ) == 0) {
      throw "Manager hasn't disliked review yet";
    }
  } else {
    const userCollection = await users();
    if (await userCollection.countDocuments({ _id: ObjectId(user_id), "review_feedback.dislikes": reviewId } ) == 0) {
      throw "User hasn't disliked review yet";
    }
  }

  //Remove one from the total dislikes of that review
  //const reviewCollection = await reviews();
  await reviewCollection.updateOne({ _id: ObjectId(reviewId) }, { $inc: { dislikes: -1 } });
  const action = await reviewCollection.findOne({ _id: ObjectId(reviewId) });

  //Remove the reviewId from the users' review_feedback so they can like it again or dislike
  if (managerStatus) {
    const managerCollection = await managers();
    await managerCollection.updateOne({ _id: ObjectId(user_id) }, { $pull: { "review_feedback.dislikes": reviewId } } );
  } else {
    const userCollection = await users();
    await userCollection.updateOne({ _id: ObjectId(user_id) }, { $pull: { "review_feedback.dislikes": reviewId } } );
  }

  //return {"reviewId": reviewId, "disliked": false}
  return action.dislikes;
}

async function editReview(reviewId, restaurantId, review, rating, imgname) {
  //Error checking
  if (!reviewId || reviewId == null) throw 'All fields need to have valid values';
  if (!review || review == null) throw 'All fields need to have valid values';
  if (!rating || rating == null) throw 'All fields need to have valid values';
  if (!imgname || imgname == null) throw 'All fields need to have valid values'
  //More error checking
  if (typeof reviewId !== 'string') throw 'Restaurant id must be a string';
  if (typeof review !== 'string') throw 'Review must be a string';
  if (typeof rating !== 'number') throw 'Rating must be a number';
  if (typeof imgname !== 'string') throw 'Image name must be a string';
  
  //More error checking
  if (isSpaces(review)) throw 'Reviewer can not be only spaces';
  if (isSpaces(imgname)) throw 'Image name can not be only spaces';
  if (rating > 5 || rating < 1) throw 'Rating must be in the range [1-5]';
  //Check for valid ID's
  if (!validId(reviewId)) throw "Restaurant Id must be a string of 24 hex characters";

  const reviewCollection = await reviews();
  const restaurantCollection = await restaurants();
  const myReview = await reviewCollection.findOne({ _id: ObjectId(reviewId) });

  if (!myReview) {
    throw 'That review was not found';
  } else {
    const date = new Date();
    //Format date 
    const month = date.getMonth() + 1; //indexes from 0
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    let period = "AM";
    if (hours > 12) {
      hours -= 12;
      period = "PM";
    }
    if (hours == 0) hours = 12;
    const timestamp = `${month}/${day}/${year} ${hours}:${minutes} ${period}`;
    const updatedInfo = await reviewCollection.updateOne({ _id: ObjectId(reviewId) }, { $set: { review: review, rating: rating, imageName: imgname, date: timestamp } });
    //Now update the new rating average for that restaurant
    const myRestaurant = await restaurantCollection.findOne(ObjectId(restaurantId));
    const allReviews = myRestaurant.reviews;

    let sum = 0;
    let count = 0;
    for (let i = 0; i < allReviews.length; i++){
      let itemReview = await reviewCollection.findOne(ObjectId(allReviews[i]));
      sum += itemReview.rating;
      count += 1;
    };
    let avg = sum / count;
    avg = Math.round(100 * avg)/100;
    await restaurantCollection.updateOne({ _id: ObjectId(restaurantId) }, { $set: { rating: avg }});
  }

  return { updatedReview: true };
}

async function getAllRepliesByRestaurant(restaurantId) {
  if (!restaurantId || restaurantId == null) throw 'Must provide a restaurant id';
  if (typeof restaurantId !== 'string') throw 'restaurant id must be a string';
  if (!validId(restaurantId)) throw "Restaurant Id must be a string of 24 hex characters";

  const myReviews = await this.getAllByRestaurant(restaurantId);
  const myReplies = [];
  //array to hold review ids so we can push them to myReplies later for deleting 
  const myReviewIds = [];

  myReviews.forEach(review => {
    review.replies.forEach(reply => {
      //Need to add the proper review id for when we remove it later
      myReviewIds.push(review._id.toString());
      myReplies.push(reply);
    })
  });

  return [myReplies, myReviewIds];
}

module.exports = {
  create,
  getAll,
  getAllByRestaurant,
  getAllByUser,
  remove,
  addLike,
  addDislike,
  removeLike,
  removeDislike,
  getAllRepliesByRestaurant,
  editReview
};
