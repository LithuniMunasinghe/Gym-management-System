import axios from 'axios';
import { API_BASE_URL } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
});

// --- HARDCODED MOCK ADAPTER STUB ---
apiClient.defaults.adapter = async (config) => {
  const { url, method, data } = config;
  console.log(`[Mock API] ${method.toUpperCase()} ${url}`, data);

  const ok = (dataPayload) => ({
    data: { StatusCode: 200, Success: true, Message: "Success", Data: dataPayload },
    status: 200, statusText: 'OK', headers: {}, config
  });

  // Auth
  if (url === '/User/Login') {
    let email = '';
    if (typeof data === 'string') {
      const params = new URLSearchParams(data);
      email = (params.get('email') || '').toLowerCase();
    }
    
    if (email.includes('trainer')) {
      return ok({ userId: 2, username: 'trainer1', email: email, phone: '0987654321', roleId: 2 }); // Role 2 = Trainer
    }
    if (email.includes('member') || email.includes('user')) {
      return ok({ userId: 3, username: 'member1', email: email, phone: '1112223333', roleId: 3 }); // Role 3 = Member
    }
    
    return ok({ userId: 1, username: 'admin', email: email || 'admin@gym.com', phone: '1234567890', roleId: 1 }); // Role 1 = Admin
  }

  // Users
  if (url.includes('/User/GetAllUsers')) return ok([
    { userId: 1, username: 'admin', email: 'admin@gym.com', roleId: 1, phone: '1234567890' },
    { userId: 2, username: 'trainer1', email: 'trainer1@gym.com', roleId: 3, phone: '0987654321' },
    { userId: 3, username: 'member1', email: 'member1@gym.com', roleId: 2, phone: '1112223333' }
  ]);

  // Members
  if (url.includes('/Member/GetAllMembers')) return ok([
    { memberId: 1, userId: 3, firstName: 'John', lastName: 'Doe', nic: '123456789V', dob: '1990-01-01', gender: 'Male', address: '123 Main St', emergencyContact: '9998887777', joinDate: '2023-01-01', status: 'Active' }
  ]);

  // Trainers
  if (url.includes('/Trainer/GetAllTrainer')) return ok([
    { trainerId: 1, userId: 2, firstName: 'Jane', lastName: 'Smith', specialization: 'Weightlifting', experienceYears: 5, hireDate: '2022-01-01', status: 'Active' }
  ]);

  // Plans
  if (url.includes('/Plan/GetAllPlans')) return ok([
    { planId: 1, planName: 'Basic Monthly', durationDays: 30, amount: 5000, description: 'Access to gym equipment' },
    { planId: 2, planName: 'Premium Annual', durationDays: 365, amount: 50000, description: 'All access + personal training' }
  ]);

  // Subscriptions
  if (url.includes('/Subscription/GetAll') || url.includes('/Subscription/GetSubscriptionById')) return ok([
    { subscriptionId: 1, memberId: 1, planId: 1, startDate: '2023-10-01', endDate: '2023-10-31', status: 'Active', amount: 5000 }
  ]);

  // Payments
  if (url.includes('/Payment/Index') || url.includes('/Payment/GetBySubscription')) return ok([
    { paymentId: 1, memberId: 1, amount: 5000, paymentDate: '2023-10-01', status: 'Completed', paymentMethod: 'Card' }
  ]);

  // Schedules
  if (url.includes('/Schedul/Index') || url.includes('/Schedul/GetByTrainer') || url.includes('/Schedul/GetByMember')) return ok([
    { scheduleId: 1, memberId: 1, trainerId: 1, date: '2023-10-15', timeSlot: '10:00 AM - 11:00 AM', status: 'Scheduled' }
  ]);

  // Trainer Assignments
  if (url.includes('/TrainerAssignment/Index') || url.includes('/TrainerAssignment/GetByTrainer') || url.includes('/TrainerAssignment/MyTrainer')) return ok([
    { assignmentId: 1, memberId: 1, trainerId: 1, assignDate: '2023-10-01', status: 'Active' }
  ]);

  // Timeslots
  if (url.includes('/TimeSlot/GetAll') || url.includes('/TrainerTimeSlot/GetAll') || url.includes('/TimeSlot/GetTrainerSlots') || url.includes('/TrainerTimeSlot/GetByTrainer')) return ok([
    { id: 1, trainerId: 1, startTime: '08:00', endTime: '10:00', dayOfWeek: 'Monday', isActive: true },
    { id: 2, trainerId: 1, startTime: '10:00', endTime: '12:00', dayOfWeek: 'Tuesday', isActive: true }
  ]);

  // Exercises
  if (url.includes('/NonEquipmentExercise/GetAll') || url.includes('/Exercise/GetAll') || url.includes('/WorkoutSessionExercise')) return ok([
    { exerciseId: 1, exerciseName: 'Pushups', category: 'Chest', description: 'Bodyweight exercise', reps: 10, sets: 3 },
    { exerciseId: 2, exerciseName: 'Squats', category: 'Legs', description: 'Bodyweight exercise', reps: 15, sets: 3 }
  ]);

  // Equipment & Usage
  if (url.includes('/Equipment/GetAll')) return ok([
    { equipmentId: 1, equipmentName: 'Treadmill', category: 'Cardio', status: 'Available', purchaseDate: '2020-01-01' },
    { equipmentId: 2, equipmentName: 'Dumbbells', category: 'Weights', status: 'Available', purchaseDate: '2020-01-01' }
  ]);
  if (url.includes('/EquipmentUsageLog') || url.includes('/EquipmentAssignment')) return ok([]);

  // Roles
  if (url.includes('/Role/GetAllRole')) return ok([
    { roleId: 1, roleName: 'Admin' },
    { roleId: 2, roleName: 'Member' },
    { roleId: 3, roleName: 'Trainer' }
  ]);

  // Attendance
  if (url.includes('/Attendance/GetAll') || url.includes('/Attendance/GetMemberAttendance')) return ok([
    { attendanceId: 1, memberId: 1, scanTime: '2023-10-10 08:00', status: 'In' }
  ]);

  // Default Fallback
  return ok({ id: 1, result: "mocked" });
};
// ----------------------------------------


// Attach auth token
apiClient.interceptors.request.use((config) => {
  const user = localStorage.getItem('dts_gym_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      config.headers['X-User-Id'] = parsed.userId;
    } catch { /* ignore */ }
  }
  return config;
});

const toForm = (obj) => new URLSearchParams(obj).toString();
const flattenObj = (prefix, obj) => {
  const result = {};
  Object.keys(obj || {}).forEach((k) => { result[`${prefix}.${k}`] = obj[k]; });
  return result;
};

// ── Auth ──────────────────────────────────────────────────────
// Changed: email + password login (was username)
export const loginUser             = (email, password) => apiClient.post('/User/Login', toForm({ email, password }));

// ── Users ──────────────────────────────────────────────────
export const getAllUsers          = ()           => apiClient.get('/User/GetAllUsers');
export const getUserById          = (id)         => apiClient.get(`/User/GetUser?id=${id}`);
export const addUser              = (user, adminId) => apiClient.post('/User/AddUser', toForm({ ...flattenObj('user', user), currentUserId: adminId }));
export const editUser             = (user, adminId) => apiClient.post('/User/EditUserById', toForm({ ...flattenObj('user', user), currentUserId: adminId }));
export const deleteUser           = (id, adminId)   => apiClient.post('/User/DeleteUser', toForm({ id, currentUserId: adminId }));

// ── Members ────────────────────────────────────────────────
export const getAllMembers         = ()           => apiClient.get('/Member/GetAllMembers');
export const addMember            = (user, member, adminId) => apiClient.post('/Member/AddMember', toForm({ ...flattenObj('user', user), ...flattenObj('member', member), adminId }));
export const editMember           = (member, userId)       => apiClient.post('/Member/EditMember', toForm({ ...flattenObj('member', member), currentLoggedInId: userId }));
export const deleteMember         = (id, adminId)          => apiClient.post('/Member/DeleteMember', toForm({ id, adminId }));

// ── Trainers ───────────────────────────────────────────────
export const getAllTrainers        = ()           => apiClient.get('/Trainer/GetAllTrainer');
export const addTrainer            = (user, adminId)       => apiClient.post('/Trainer/AddTrainer', toForm({ ...flattenObj('user', user), adminId }));
export const editTrainer           = (trainer, userId)     => apiClient.post('/Trainer/EditTrainer', toForm({ ...flattenObj('trainer', trainer), currentLoggedInId: userId }));

// ── Plans ──────────────────────────────────────────────────
export const getAllPlans           = ()           => apiClient.get('/Plan/GetAllPlans');

// ── Subscriptions ──────────────────────────────────────────
export const getAllSubscriptions   = ()           => apiClient.get('/Subscription/GetAll');
export const getSubscriptionById  = (id)         => apiClient.get(`/Subscription/GetSubscriptionById?subscribeid=${id}`);
export const addSubscription      = (sub)        => apiClient.post('/Subscription/AddSubscription', toForm(flattenObj('sub', sub)));
export const editSubscription     = (sub, adminId) => apiClient.post('/Subscription/EditSubscriptionById', toForm({ ...flattenObj('subscribe', sub), adminId }));
export const deleteSubscription   = (subId, adminId) => apiClient.post('/Subscription/DeleteSubscriptionById', toForm({ subId, adminId }));

// ── Payments ───────────────────────────────────────────────
export const getAllPayments        = ()           => apiClient.get('/Payment/Index');
export const getPaymentBySubscription = (subscriptionId) => apiClient.get(`/Payment/GetBySubscription?subscriptionId=${subscriptionId}`);
export const addPayment           = (model)      => apiClient.post('/Payment/Add', toForm(flattenObj('model', model)));
export const updatePaymentStatus  = (paymentId, status) => apiClient.post('/Payment/UpdateStatus', toForm({ paymentId, status }));
export const updatePaymentStatusBySubscription = (subscriptionId, status) => apiClient.post('/Payment/UpdateStatusBySubscription', toForm({ subscriptionId, status }));
export const refundPayment        = (paymentId, adminId) => apiClient.post('/Payment/RefundPayment', toForm({ paymentId, adminId }));
// Cash receipt
export const generateCashReceipt  = (paymentId) => apiClient.get(`/Payment/GetReceipt?paymentId=${paymentId}`);

// ── Schedules ──────────────────────────────────────────────
export const getAllSchedules       = ()           => apiClient.get('/Schedul/Index');
export const getScheduleById      = (id)         => apiClient.get(`/Schedul/GetById?scheduleId=${id}`);
export const addSchedule          = (model)      => apiClient.post('/Schedul/JoinSession', toForm(flattenObj('model', model)));
export const updateSchedule       = (model, adminId) => apiClient.post('/Schedul/AdminUpdate', toForm({ ...flattenObj('model', model), adminId }));
export const updateScheduleStatus = (scheduleId, status, userId) => apiClient.post('/Schedul/UpdateStatus', toForm({ scheduleId, status, userId }));
export const deleteSchedule       = (scheduleId) => apiClient.post('/Schedul/Delete', toForm({ scheduleId }));
export const getSchedulesByMember = (memberId)   => apiClient.get(`/Schedul/GetByMember?memberId=${memberId}`);
export const getSchedulesByTrainer= (trainerId)  => apiClient.get(`/Schedul/GetByTrainer?trainerId=${trainerId}`);

// ── Timeslots (master list) ────────────────────────────────
export const getAllTimeslots       = ()           => apiClient.get('/TimeSlot/GetAll');

// ── TrainerTimeslots (new ER) ──────────────────────────────
export const getTrainerTimeslots  = (trainerId)  => apiClient.get(`/TrainerTimeSlot/GetByTrainer?trainerId=${trainerId}`);
export const getAllTrainerTimeslots= ()           => apiClient.get('/TrainerTimeSlot/GetAll');
export const addTrainerTimeslot   = (model)      => apiClient.post('/TrainerTimeSlot/Add', toForm(flattenObj('model', model)));
export const deleteTrainerTimeslot= (id)         => apiClient.post('/TrainerTimeSlot/Delete', toForm({ id }));
export const toggleTrainerTimeslot= (id, isActive) => apiClient.post('/TrainerTimeSlot/Toggle', toForm({ id, isActive }));

// ── Legacy Timeslots (keep for backward compat) ────────────
export const getTimeslotsByTrainer = (trainerId) => apiClient.get(`/TimeSlot/GetTrainerSlots?trainerId=${trainerId}`);
export const addTimeslot          = (model)      => apiClient.post('/TimeSlot/AddSlot', toForm(flattenObj('model', model)));
export const deleteTimeslot       = (timeslotId) => apiClient.post('/TimeSlot/Delete', toForm({ timeslotId }));
export const toggleTimeslotAvailability = (timeslotId, isAvailable) => apiClient.post('/TimeSlot/ToggleAvailability', toForm({ timeslotId, isAvailable }));

// ── Trainer Assignments ────────────────────────────────────
export const getAllAssignments     = ()           => apiClient.get('/TrainerAssignment/Index');
export const getAssignmentsByMember = (memberId) => apiClient.get(`/TrainerAssignment/MyTrainer?memberId=${memberId}`);
export const getAssignmentsByTrainer = (trainerId) => apiClient.get(`/TrainerAssignment/GetByTrainer?trainerId=${trainerId}`);
export const addAssignment        = (model, adminId) => apiClient.post('/TrainerAssignment/AssignTrainer', toForm({ ...flattenObj('model', model), adminId }));
export const deleteAssignment     = (assignmentId, adminId) => apiClient.post('/TrainerAssignment/RemoveAssignment', toForm({ assignmentId, adminId }));

// ── NonEquipmentExercises (new ER) ─────────────────────────
export const getAllNonEquipmentExercises = () => apiClient.get('/NonEquipmentExercise/GetAll');
export const getNonEquipmentBySchedule  = (scheduleId) => apiClient.get(`/NonEquipmentExercise/GetBySchedule?scheduleId=${scheduleId}`);
export const addNonEquipmentExercise    = (model, userId) => apiClient.post('/NonEquipmentExercise/Add', toForm({ ...flattenObj('model', model), currentUserId: userId }));
export const updateNonEquipmentExercise = (model, userId) => apiClient.post('/NonEquipmentExercise/Update', toForm({ ...flattenObj('model', model), currentUserId: userId }));
export const deleteNonEquipmentExercise = (id) => apiClient.post('/NonEquipmentExercise/Delete', toForm({ id }));

// ── Legacy workouts ────────────────────────────────────────
export const getAllExercises       = ()           => apiClient.get('/WorkoutSessionExercise/GetAll');
export const getWorkoutsBySchedule = (scheduleId) => apiClient.get(`/WorkoutSessionExercise/GetBySchedule?scheduleId=${scheduleId}`);
export const addWorkout           = (model, userId) => apiClient.post('/WorkoutSessionExercise/Add', toForm({ ...flattenObj('model', model), currentUserId: userId }));
export const updateWorkout        = (model, userId) => apiClient.post('/WorkoutSessionExercise/Update', toForm({ ...flattenObj('model', model), currentUserId: userId }));
export const deleteWorkout        = (sessionId)  => apiClient.post('/WorkoutSessionExercise/Delete', toForm({ sessionId }));

// ── Exercise Catalog ───────────────────────────────────────
export const getExerciseCatalog   = ()           => apiClient.get('/Exercise/GetAll');

// ── Attendance ─────────────────────────────────────────────
export const tapRFID              = (rfidNo)     => apiClient.post('/Attendance/TapCard', toForm({ rfidNo }));
export const getMemberAttendance  = (memberId)   => apiClient.get(`/Attendance/GetMemberAttendance?memberId=${memberId}`);
export const getAllAttendance      = ()           => apiClient.get('/Attendance/GetAll');

// ── RFID ───────────────────────────────────────────────────
export const registerCard         = (model)      => apiClient.post('/RFIDTag/RegisterCard', toForm(flattenObj('model', model)));
export const getMemberByCard      = (rfidNo)     => apiClient.get(`/RFIDTag/GetMemberByCard?rfidNo=${rfidNo}`);

// ── Equipment ─────────────────────────────────────────────
export const getAllEquipment       = ()           => apiClient.get('/Equipment/GetAll');
export const addEquipment         = (model, adminId) => apiClient.post('/Equipment/Add', toForm({ ...flattenObj('model', model), adminId }));
export const editEquipment        = (model, adminId) => apiClient.post('/Equipment/Edit', toForm({ ...flattenObj('model', model), adminId }));
export const deleteEquipment      = (id, adminId)   => apiClient.post('/Equipment/Delete', toForm({ id, adminId }));

// ── Equipment Usage (Live tracking) ──────────────────────
export const getLiveEquipmentUsage = ()          => apiClient.get('/EquipmentUsageLog/GetLive');
export const getEquipmentUsageBySchedule = (scheduleId) => apiClient.get(`/EquipmentUsageLog/GetBySchedule?scheduleId=${scheduleId}`);

// ── Equipment Assignments ──────────────────────────────────
export const getEquipmentAssignmentsBySchedule = (scheduleId) => apiClient.get(`/EquipmentAssignment/GetBySchedule?scheduleId=${scheduleId}`);
export const addEquipmentAssignment = (model, userId) => apiClient.post('/EquipmentAssignment/Add', toForm({ ...flattenObj('model', model), userId }));

// ── Roles ──────────────────────────────────────────────────
export const getAllRoles          = (userId)     => apiClient.get(`/Role/GetAllRole?userId=${userId}`);
