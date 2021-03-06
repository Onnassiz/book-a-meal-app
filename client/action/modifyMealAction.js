import { MODIFY_MEAL_SUCCESS, MODIFY_MEAL_FAILURE } from '../actionTypes';
import axios from '../helpers/axios';
import displayToast from '../helpers/displayToast';

/**
* @param {String} mealId - meal id
* @param {Object} mealDetails - meals details
* @param {Function} action - action to get meals
*
* @returns {Promise}  - dispatches action with true or false
*/
const modifyMealAction = (mealId, mealDetails) => dispatch => axios.put(`/meals/${mealId}`, mealDetails)
  .then(() => {
    dispatch({
      type: MODIFY_MEAL_SUCCESS,
      payload: true,
    });
    displayToast('success', 'Meal Modified Successfully');
  })
  .catch((err) => {
    dispatch({
      type: MODIFY_MEAL_FAILURE,
      payload: false,
    });
    displayToast('error', err.response.data.message);
  });

export default modifyMealAction;
