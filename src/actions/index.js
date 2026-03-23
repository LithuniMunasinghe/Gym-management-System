import { ACTIONS, ROLES } from '../constants';
import * as api from '../services/api';
import { isSuccess, getErrorMsg } from '../utils';

// ── UI ────────────────────────────────────────────────────
export const showToast = (message, type = 'info') => ({
  type: ACTIONS.SHOW_TOAST,
  payload: { message, type, id: Date.now() },
});
export const hideToast = (id) => ({ type: ACTIONS.HIDE_TOAST, payload: id });
export const setTheme  = (theme) => ({ type: ACTIONS.SET_THEME, payload: theme });

// ── Auth ──────────────────────────────────────────────────
// Now uses email instead of username
export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: ACTIONS.LOGIN_REQUEST });
  try {
    const res = await api.loginUser(email, password);
    const data = res.data;
    if (data?.StatusCode === 200 && data?.Data) {
      const u = data.Data;
      const roleId = parseInt(u.roleId);
      const user = {
        userId:   u.userId,
        username: u.username,
        email:    u.email,
        phone:    u.phone,
        roleId:   roleId,
        roleName: roleId === ROLES.ADMIN ? 'Admin' : roleId === ROLES.TRAINER ? 'Trainer' : 'Member',
      };
      localStorage.setItem('dts_gym_user', JSON.stringify(user));
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: user });
      dispatch(showToast(`Welcome back, ${user.username}!`, 'success'));
    } else {
      dispatch({ type: ACTIONS.LOGIN_FAILURE, payload: data?.Message || 'Invalid email or password' });
    }
  } catch {
    dispatch({ type: ACTIONS.LOGIN_FAILURE, payload: 'Could not connect to server. Check backend is running.' });
  }
};

export const restoreSession = () => (dispatch) => {
  try {
    const stored = localStorage.getItem('dts_gym_user');
    if (stored) {
      const user = JSON.parse(stored);
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: user });
    }
  } catch { /* ignore */ }
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('dts_gym_user');
  dispatch({ type: ACTIONS.LOGOUT });
};

// ── Users ─────────────────────────────────────────────────
export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_USERS_REQUEST });
  try {
    const res = await api.getAllUsers();
    dispatch({ type: ACTIONS.FETCH_USERS_SUCCESS, payload: res.data?.Data || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_USERS_FAILURE });
    dispatch(showToast('Failed to load users', 'error'));
  }
};
export const addUser = (userData, adminId) => async (dispatch) => {
  try {
    const res = await api.addUser(userData, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('User added', 'success')); dispatch(fetchUsers()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add user', 'error')); }
  return false;
};
export const editUserAction = (userData, adminId) => async (dispatch) => {
  try {
    const res = await api.editUser(userData, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('User updated', 'success')); dispatch(fetchUsers()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update user', 'error')); }
  return false;
};
export const deleteUser = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteUser(id, adminId);
    if (isSuccess(res.data)) { dispatch({ type: ACTIONS.DELETE_USER_SUCCESS, payload: id }); dispatch(showToast('User deleted', 'success')); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete user', 'error')); }
};

// ── Members ───────────────────────────────────────────────
export const fetchMembers = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_MEMBERS_REQUEST });
  try {
    const res = await api.getAllMembers();
    dispatch({ type: ACTIONS.FETCH_MEMBERS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_MEMBERS_FAILURE }); dispatch(showToast('Failed to load members', 'error')); }
};
export const addMember = (user, member, adminId) => async (dispatch) => {
  try {
    const res = await api.addMember(user, member, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Member added', 'success')); dispatch(fetchMembers()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add member', 'error')); }
  return false;
};
export const editMember = (member, userId) => async (dispatch) => {
  try {
    const res = await api.editMember(member, userId);
    if (isSuccess(res.data)) { dispatch(showToast('Member updated', 'success')); dispatch(fetchMembers()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update member', 'error')); }
  return false;
};
export const deleteMember = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteMember(id, adminId);
    if (isSuccess(res.data)) { dispatch({ type: ACTIONS.DELETE_MEMBER_SUCCESS, payload: id }); dispatch(showToast('Member deleted', 'success')); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete member', 'error')); }
};

// ── Trainers ──────────────────────────────────────────────
export const fetchTrainers = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TRAINERS_REQUEST });
  try {
    const res = await api.getAllTrainers();
    dispatch({ type: ACTIONS.FETCH_TRAINERS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_TRAINERS_FAILURE }); dispatch(showToast('Failed to load trainers', 'error')); }
};
export const addTrainer = (userData, adminId) => async (dispatch) => {
  try {
    const res = await api.addTrainer(userData, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Trainer added', 'success')); dispatch(fetchTrainers()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add trainer', 'error')); }
  return false;
};
export const editTrainer = (trainer, userId) => async (dispatch) => {
  try {
    const res = await api.editTrainer(trainer, userId);
    if (isSuccess(res.data)) { dispatch(showToast('Trainer updated', 'success')); dispatch(fetchTrainers()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update trainer', 'error')); }
  return false;
};

// ── Plans ─────────────────────────────────────────────────
export const fetchPlans = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_PLANS_REQUEST });
  try {
    const res = await api.getAllPlans();
    dispatch({ type: ACTIONS.FETCH_PLANS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_PLANS_FAILURE }); dispatch(showToast('Failed to load plans', 'error')); }
};

// ── Subscriptions ─────────────────────────────────────────
export const fetchSubscriptions = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_SUBSCRIPTIONS_REQUEST });
  try {
    const res = await api.getAllSubscriptions();
    dispatch({ type: ACTIONS.FETCH_SUBSCRIPTIONS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_SUBSCRIPTIONS_FAILURE }); dispatch(showToast('Failed to load subscriptions', 'error')); }
};
export const addSubscription = (sub) => async (dispatch) => {
  try {
    const res = await api.addSubscription(sub);
    if (isSuccess(res.data)) { dispatch(showToast('Subscription created!', 'success')); dispatch(fetchSubscriptions()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add subscription', 'error')); }
  return false;
};
export const deleteSubscription = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteSubscription(id, adminId);
    if (isSuccess(res.data)) { dispatch({ type: ACTIONS.DELETE_SUBSCRIPTION_SUCCESS, payload: id }); dispatch(showToast('Subscription deleted', 'success')); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete', 'error')); }
};

// ── Payments ──────────────────────────────────────────────
export const fetchPayments = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_PAYMENTS_REQUEST });
  try {
    const res = await api.getAllPayments();
    dispatch({ type: ACTIONS.FETCH_PAYMENTS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_PAYMENTS_FAILURE }); dispatch(showToast('Failed to load payments', 'error')); }
};
export const refundPayment = (paymentId, adminId) => async (dispatch) => {
  try {
    const res = await api.refundPayment(paymentId, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Payment refunded', 'success')); dispatch(fetchPayments()); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to refund', 'error')); }
};
export const updatePaymentStatus = (paymentId, status) => async (dispatch) => {
  try {
    const res = await api.updatePaymentStatus(paymentId, status);
    if (isSuccess(res.data)) { dispatch(showToast('Payment status updated', 'success')); dispatch(fetchPayments()); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update status', 'error')); }
};

// ── Schedules ─────────────────────────────────────────────
export const fetchSchedules = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_SCHEDULES_REQUEST });
  try {
    const res = await api.getAllSchedules();
    dispatch({ type: ACTIONS.FETCH_SCHEDULES_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_SCHEDULES_FAILURE }); dispatch(showToast('Failed to load schedules', 'error')); }
};
export const fetchSchedulesByMember = (memberId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_SCHEDULES_REQUEST });
  try {
    const res = await api.getSchedulesByMember(memberId);
    dispatch({ type: ACTIONS.FETCH_SCHEDULES_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_SCHEDULES_FAILURE }); }
};
export const fetchSchedulesByTrainer = (trainerId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_SCHEDULES_REQUEST });
  try {
    const res = await api.getSchedulesByTrainer(trainerId);
    dispatch({ type: ACTIONS.FETCH_SCHEDULES_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_SCHEDULES_FAILURE }); }
};
export const addSchedule = (model) => async (dispatch) => {
  try {
    const res = await api.addSchedule(model);
    if (isSuccess(res.data)) { dispatch(showToast('Session booked!', 'success')); dispatch(fetchSchedules()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to book session', 'error')); }
  return false;
};
// Trainer approves/rejects schedule
export const updateScheduleStatus = (scheduleId, status, userId) => async (dispatch) => {
  try {
    const res = await api.updateScheduleStatus(scheduleId, status, userId);
    if (isSuccess(res.data)) {
      dispatch(showToast(`Session ${status === 'Scheduled' ? 'approved' : 'rejected'}!`, 'success'));
      dispatch(fetchSchedulesByTrainer(userId));
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update session', 'error')); }
};
export const confirmSchedule = (model, adminId) => async (dispatch) => {
  try {
    const res = await api.updateSchedule({ ...model, status: 'Scheduled' }, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Session confirmed!', 'success')); dispatch(fetchSchedules()); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to confirm', 'error')); }
};
export const deleteSchedule = (scheduleId) => async (dispatch) => {
  try {
    const res = await api.deleteSchedule(scheduleId);
    if (isSuccess(res.data)) { dispatch(showToast('Schedule deleted', 'success')); dispatch(fetchSchedules()); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete schedule', 'error')); }
};

// ── Timeslots ─────────────────────────────────────────────
export const fetchAllTimeslots = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TIMESLOTS_REQUEST });
  try {
    const res = await api.getAllTimeslots();
    dispatch({ type: ACTIONS.FETCH_TIMESLOTS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_TIMESLOTS_FAILURE }); dispatch(showToast('Failed to load timeslots', 'error')); }
};
export const fetchTimeslotsByTrainer = (trainerId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TIMESLOTS_REQUEST });
  try {
    const res = await api.getTimeslotsByTrainer(trainerId);
    dispatch({ type: ACTIONS.FETCH_TIMESLOTS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_TIMESLOTS_FAILURE }); }
};

// ── TrainerTimeslots ──────────────────────────────────────
export const fetchTrainerTimeslots = (trainerId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TRAINER_TIMESLOTS_REQUEST });
  try {
    const res = await api.getTrainerTimeslots(trainerId);
    dispatch({ type: ACTIONS.FETCH_TRAINER_TIMESLOTS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_TRAINER_TIMESLOTS_FAILURE }); }
};
export const addTimeslot = (model) => async (dispatch) => {
  try {
    const res = await api.addTimeslot(model);
    if (isSuccess(res.data)) { dispatch(showToast('Timeslot added!', 'success')); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add timeslot', 'error')); }
  return false;
};
export const deleteTimeslot = (timeslotId) => async (dispatch) => {
  try {
    const res = await api.deleteTimeslot(timeslotId);
    if (isSuccess(res.data)) dispatch(showToast('Timeslot deleted', 'success'));
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete timeslot', 'error')); }
};
export const toggleTimeslot = (id, status) => async (dispatch) => {
  try {
    const res = await api.toggleTimeslotAvailability(id, status);
    if (isSuccess(res.data)) dispatch(showToast('Slot updated', 'success'));
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update slot', 'error')); }
};

// ── Assignments ───────────────────────────────────────────
export const fetchAssignments = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_ASSIGNMENTS_REQUEST });
  try {
    const res = await api.getAllAssignments();
    dispatch({ type: ACTIONS.FETCH_ASSIGNMENTS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_ASSIGNMENTS_FAILURE }); dispatch(showToast('Failed to load assignments', 'error')); }
};
export const addAssignment = (model, adminId) => async (dispatch) => {
  try {
    const res = await api.addAssignment(model, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Trainer assigned!', 'success')); dispatch(fetchAssignments()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to assign trainer', 'error')); }
  return false;
};
export const removeAssignment = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteAssignment(id, adminId);
    if (isSuccess(res.data)) { dispatch({ type: ACTIONS.DELETE_ASSIGNMENT_SUCCESS, payload: id }); dispatch(showToast('Assignment removed', 'success')); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to remove assignment', 'error')); }
};

// ── Workouts / NonEquipment Exercises ─────────────────────
export const fetchWorkoutsBySchedule = (scheduleId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_WORKOUTS_REQUEST });
  try {
    const res = await api.getWorkoutsBySchedule(scheduleId);
    dispatch({ type: ACTIONS.FETCH_WORKOUTS_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_WORKOUTS_FAILURE }); dispatch(showToast('Failed to load workouts', 'error')); }
};
export const addWorkout = (model, userId) => async (dispatch) => {
  try {
    const res = await api.addWorkout(model, userId);
    if (isSuccess(res.data)) { dispatch(showToast('Exercise added!', 'success')); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add exercise', 'error')); }
  return false;
};
export const updateWorkout = (model, userId) => async (dispatch) => {
  try {
    const res = await api.updateWorkout(model, userId);
    if (isSuccess(res.data)) { dispatch(showToast('Exercise updated!', 'success')); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update exercise', 'error')); }
  return false;
};

// ── Attendance ────────────────────────────────────────────
export const recordAttendance = (rfidNo) => async (dispatch) => {
  try {
    const res = await api.tapRFID(rfidNo);
    if (isSuccess(res.data)) { dispatch(showToast('Attendance recorded!', 'success')); return res.data?.Data || true; }
    else dispatch(showToast(getErrorMsg(res.data) || 'RFID not recognized', 'error'));
  } catch { dispatch(showToast('Failed to record attendance', 'error')); }
  return false;
};
export const fetchMemberAttendance = (memberId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_ATTENDANCE_REQUEST });
  try {
    const res = await api.getMemberAttendance(memberId);
    dispatch({ type: ACTIONS.FETCH_ATTENDANCE_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_ATTENDANCE_FAILURE }); }
};

// ── RFID ──────────────────────────────────────────────────
export const registerRFID = (model) => async (dispatch) => {
  try {
    const res = await api.registerCard(model);
    if (isSuccess(res.data)) { dispatch(showToast('RFID card registered!', 'success')); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to register card', 'error')); }
  return false;
};

// ── Equipment ─────────────────────────────────────────────
export const fetchEquipment = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_EQUIPMENT_REQUEST });
  try {
    const res = await api.getAllEquipment();
    dispatch({ type: ACTIONS.FETCH_EQUIPMENT_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_EQUIPMENT_FAILURE }); }
};
export const addEquipment = (model, adminId) => async (dispatch) => {
  try {
    const res = await api.addEquipment(model, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Equipment added!', 'success')); dispatch(fetchEquipment()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add equipment', 'error')); }
  return false;
};

// ── Live Equipment Usage ──────────────────────────────────
export const fetchLiveEquipmentUsage = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_EQUIPMENT_USAGE_REQUEST });
  try {
    const res = await api.getLiveEquipmentUsage();
    dispatch({ type: ACTIONS.FETCH_EQUIPMENT_USAGE_SUCCESS, payload: res.data?.Data || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_EQUIPMENT_USAGE_FAILURE }); }
};
