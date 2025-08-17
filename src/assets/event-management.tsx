import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, Award, Save, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

// Mock data
const mockEvents = [
  { id: 1, name: "Hội thảo Khoa học 2024", description: "Hội thảo nghiên cứu khoa học năm 2024", start_date: "2024-09-15T08:00", end_date: "2024-09-15T17:00" },
  { id: 2, name: "Đánh giá học kỳ", description: "Đánh giá kết quả học tập học kỳ 1", start_date: "2024-10-01T08:00", end_date: "2024-10-05T17:00" }
];

const mockUsers = [
  { id: 1, full_name: "TS. Nguyễn Văn A", academic_rank: "Tiến sĩ", academic_degree: "Thạc sĩ" },
  { id: 2, full_name: "PGS. Trần Thị B", academic_rank: "Phó Giáo sư", academic_degree: "Tiến sĩ" },
  { id: 3, full_name: "ThS. Lê Văn C", academic_rank: "Thạc sĩ", academic_degree: "Thạc sĩ" },
  { id: 4, full_name: "GS. Phạm Thị D", academic_rank: "Giáo sư", academic_degree: "Tiến sĩ" }
];

const mockDuties = [
  { id: 1, name: "Chủ trì", description: "Chủ trì sự kiện" },
  { id: 2, name: "Phó chủ trì", description: "Phó chủ trì sự kiện" },
  { id: 3, name: "Thư ký", description: "Thư ký ghi chép" },
  { id: 4, name: "Thành viên", description: "Thành viên tham gia" }
];

function EventManagement() {
  const [currentView, setCurrentView] = useState('list'); // list, create, edit
  const [events, setEvents] = useState(mockEvents);
  const [editingEvent, setEditingEvent] = useState(null);
  const [expandedAssignment, setExpandedAssignment] = useState(false);

  // Form state cho tạo/sửa sự kiện
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    selectedDuties: [], // Danh sách duty_id đã chọn cho sự kiện
    dutyScores: {},     // duty_id -> score
    selectedUsers: [],  // Danh sách user_id đã chọn cho sự kiện
    assignments: []     // [{user_id, duty_id}] - mỗi user chỉ có 1 assignment
  });

  // State cho tìm kiếm và modal
  const [dutySearchTerm, setDutySearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleCreateEvent = () => {
    setEventForm({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      selectedDuties: [],
      dutyScores: {},
      selectedUsers: [],
      assignments: []
    });
    setCurrentView('create');
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    // Mock data cho edit
    const mockSelectedDuties = [1, 2, 3, 4];
    const mockSelectedUsers = [1, 2, 3];
    setEventForm({
      name: event.name,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      selectedDuties: mockSelectedDuties,
      dutyScores: { 1: 10, 2: 8, 3: 5, 4: 3 },
      selectedUsers: mockSelectedUsers,
      assignments: [
        { user_id: 1, duty_id: 1 },
        { user_id: 2, duty_id: 2 },
        { user_id: 3, duty_id: 3 }
      ]
    });
    setCurrentView('edit');
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleSaveEvent = () => {
    // Validation
    const unassignedUsers = eventForm.selectedUsers.filter(userId => 
      !eventForm.assignments.find(a => a.user_id === userId)
    );
    
    const unassignedDuties = eventForm.selectedDuties.filter(dutyId => 
      !eventForm.assignments.find(a => a.duty_id === dutyId)
    );

    if (unassignedUsers.length > 0 || unassignedDuties.length > 0) {
      alert('Vui lòng hoàn thành phân công cho tất cả người dùng và nhiệm vụ được chọn!');
      return;
    }

    // Logic lưu sự kiện
    console.log('Saving event:', eventForm);
    setCurrentView('list');
  };

  const handleAssignUser = (userId, dutyId) => {
    // Xóa assignment cũ của user này (nếu có)
    const newAssignments = eventForm.assignments.filter(a => a.user_id !== userId);
    
    if (dutyId) {
      // Kiểm tra xem duty này đã được gán cho user khác chưa
      const existingAssignment = eventForm.assignments.find(a => a.duty_id === dutyId);
      if (existingAssignment && existingAssignment.user_id !== userId) {
        alert(`Nhiệm vụ này đã được gán cho ${getUserName(existingAssignment.user_id)}. Mỗi nhiệm vụ chỉ có thể được gán cho một người duy nhất.`);
        return;
      }
      
      newAssignments.push({ user_id: userId, duty_id: dutyId });
    }
    
    setEventForm({ ...eventForm, assignments: newAssignments });
  };

  const getUserDuty = (userId) => {
    const assignment = eventForm.assignments.find(a => a.user_id === userId);
    return assignment ? assignment.duty_id : null;
  };

  const getDutyAssignedUser = (dutyId) => {
    const assignment = eventForm.assignments.find(a => a.duty_id === dutyId);
    return assignment ? assignment.user_id : null;
  };

  const getUserName = (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.full_name : '';
  };

  const getDutyName = (dutyId) => {
    const duty = mockDuties.find(d => d.id === dutyId);
    return duty ? duty.name : '';
  };

  const updateDutyScore = (dutyId, score) => {
    setEventForm({
      ...eventForm,
      dutyScores: { ...eventForm.dutyScores, [dutyId]: score }
    });
  };

  // Functions cho việc chọn duty và user
  const addDutyToEvent = (dutyId) => {
    if (!eventForm.selectedDuties.includes(dutyId)) {
      setEventForm({
        ...eventForm,
        selectedDuties: [...eventForm.selectedDuties, dutyId],
        dutyScores: { ...eventForm.dutyScores, [dutyId]: 0 }
      });
    }
    setShowDutyModal(false);
  };

  const removeDutyFromEvent = (dutyId) => {
    const newSelectedDuties = eventForm.selectedDuties.filter(id => id !== dutyId);
    const newDutyScores = { ...eventForm.dutyScores };
    delete newDutyScores[dutyId];
    const newAssignments = eventForm.assignments.filter(a => a.duty_id !== dutyId);
    
    setEventForm({
      ...eventForm,
      selectedDuties: newSelectedDuties,
      dutyScores: newDutyScores,
      assignments: newAssignments
    });
  };

  const addUserToEvent = (userId) => {
    if (!eventForm.selectedUsers.includes(userId)) {
      setEventForm({
        ...eventForm,
        selectedUsers: [...eventForm.selectedUsers, userId]
      });
    }
    setShowUserModal(false);
  };

  const removeUserFromEvent = (userId) => {
    const newSelectedUsers = eventForm.selectedUsers.filter(id => id !== userId);
    const newAssignments = eventForm.assignments.filter(a => a.user_id !== userId);
    
    setEventForm({
      ...eventForm,
      selectedUsers: newSelectedUsers,
      assignments: newAssignments
    });
  };

  // Filtered data cho search
  const filteredDuties = mockDuties.filter(duty =>
    duty.name.toLowerCase().includes(dutySearchTerm.toLowerCase()) ||
    duty.description.toLowerCase().includes(dutySearchTerm.toLowerCase())
  );

  const filteredUsers = mockUsers.filter(user =>
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.academic_rank.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Kiểm tra trạng thái hoàn thành
  const getCompletionStatus = () => {
    const unassignedUsers = eventForm.selectedUsers.filter(userId => 
      !eventForm.assignments.find(a => a.user_id === userId)
    );
    
    const unassignedDuties = eventForm.selectedDuties.filter(dutyId => 
      !eventForm.assignments.find(a => a.duty_id === dutyId)
    );

    return {
      unassignedUsers,
      unassignedDuties,
      isComplete: unassignedUsers.length === 0 && unassignedDuties.length === 0
    };
  };

  if (currentView === 'list') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sự kiện</h1>
          <button
            onClick={handleCreateEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Tạo sự kiện
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sự kiện</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.start_date).toLocaleDateString('vi-VN')} - {new Date(event.end_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const completionStatus = getCompletionStatus();

  // Form tạo/sửa sự kiện
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {currentView === 'create' ? 'Tạo sự kiện mới' : 'Chỉnh sửa sự kiện'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleSaveEvent}
            disabled={!completionStatus.isComplete}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              completionStatus.isComplete 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save size={20} />
            Lưu
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <X size={20} />
            Hủy
          </button>
        </div>
      </div>

      {/* Cảnh báo trạng thái chưa hoàn thành */}
      {!completionStatus.isComplete && (eventForm.selectedUsers.length > 0 || eventForm.selectedDuties.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-yellow-800 font-medium mb-2">Chưa hoàn thành phân công</h3>
              {completionStatus.unassignedUsers.length > 0 && (
                <p className="text-yellow-700 text-sm mb-1">
                  <strong>Người dùng chưa được phân công:</strong> {
                    completionStatus.unassignedUsers.map(userId => getUserName(userId)).join(', ')
                  }
                </p>
              )}
              {completionStatus.unassignedDuties.length > 0 && (
                <p className="text-yellow-700 text-sm">
                  <strong>Nhiệm vụ chưa được gán:</strong> {
                    completionStatus.unassignedDuties.map(dutyId => getDutyName(dutyId)).join(', ')
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Thông tin cơ bản sự kiện */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            Thông tin sự kiện
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên sự kiện</label>
              <input
                type="text"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên sự kiện"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <input
                type="text"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mô tả sự kiện"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                value={eventForm.start_date}
                onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                value={eventForm.end_date}
                onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cài đặt điểm cho các nhiệm vụ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Award className="text-yellow-600" size={24} />
              Nhiệm vụ và điểm số ({eventForm.selectedDuties.length} nhiệm vụ)
            </h2>
            <button
              onClick={() => setShowDutyModal(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus size={16} />
              Thêm nhiệm vụ
            </button>
          </div>

          {eventForm.selectedDuties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có nhiệm vụ nào được chọn</p>
              <p className="text-sm">Nhấn "Thêm nhiệm vụ" để bắt đầu</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventForm.selectedDuties.map((dutyId) => {
                const duty = mockDuties.find(d => d.id === dutyId);
                const assignedUser = getDutyAssignedUser(dutyId);
                return (
                  <div key={dutyId} className="border border-gray-200 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeDutyFromEvent(dutyId)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                    <h3 className="font-medium text-gray-800 mb-2 pr-6">{duty?.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{duty?.description}</p>
                    
                    {assignedUser && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                        <p className="text-sm text-green-800">
                          <strong>Đã gán:</strong> {getUserName(assignedUser)}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Điểm</label>
                      <input
                        type="number"
                        value={eventForm.dutyScores[dutyId] || ''}
                        onChange={(e) => updateDutyScore(dutyId, parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Phân công người dùng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="text-green-600" size={24} />
              Phân công nhiệm vụ ({eventForm.selectedUsers.length} người dùng)
            </h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Plus size={16} />
              Thêm người dùng
            </button>
          </div>
          
          {eventForm.selectedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có người dùng nào được chọn</p>
              <p className="text-sm">Nhấn "Thêm người dùng" để bắt đầu phân công</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Lưu ý:</strong> Mỗi người dùng chỉ có thể được gán một nhiệm vụ duy nhất. Mỗi nhiệm vụ chỉ có thể được gán cho một người duy nhất.
                </p>
              </div>
              
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học hàm/Học vị</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhiệm vụ được gán</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventForm.selectedUsers.map((userId) => {
                    const user = mockUsers.find(u => u.id === userId);
                    const assignedDutyId = getUserDuty(userId);
                    const score = assignedDutyId ? eventForm.dutyScores[assignedDutyId] || 0 : 0;
                    
                    return (
                      <tr key={userId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user?.full_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user?.academic_rank} - {user?.academic_degree}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={assignedDutyId || ''}
                            onChange={(e) => handleAssignUser(userId, parseInt(e.target.value) || null)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          >
                            <option value="">-- Chọn nhiệm vụ --</option>
                            {eventForm.selectedDuties.map((dutyId) => {
                              const duty = mockDuties.find(d => d.id === dutyId);
                              const existingAssignment = getDutyAssignedUser(dutyId);
                              const isDisabled = existingAssignment && existingAssignment !== userId;
                              
                              return (
                                <option 
                                  key={dutyId} 
                                  value={dutyId}
                                  disabled={isDisabled}
                                >
                                  {duty?.name} ({eventForm.dutyScores[dutyId] || 0} điểm)
                                  {isDisabled ? ` - Đã gán cho ${getUserName(existingAssignment)}` : ''}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assignedDutyId 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {score} điểm
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => removeUserFromEvent(userId)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tóm tắt phân công */}
        {eventForm.assignments.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Tóm tắt phân công</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eventForm.assignments.map((assignment, index) => {
                const user = mockUsers.find(u => u.id === assignment.user_id);
                const duty = mockDuties.find(d => d.id === assignment.duty_id);
                const score = eventForm.dutyScores[assignment.duty_id] || 0;
                
                return (
                  <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-gray-800">{user?.full_name}</div>
                    <div className="text-sm text-gray-600">{duty?.name}</div>
                    <div className="text-sm font-medium text-blue-600">{score} điểm</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal chọn nhiệm vụ */}
        {showDutyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Chọn nhiệm vụ</h3>
                <button
                  onClick={() => setShowDutyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm nhiệm vụ..."
                  value={dutySearchTerm}
                  onChange={(e) => setDutySearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="space-y-2">
                {filteredDuties
                  .filter(duty => !eventForm.selectedDuties.includes(duty.id))
                  .map((duty) => (
                    <div
                      key={duty.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addDutyToEvent(duty.id)}
                    >
                      <h4 className="font-medium text-gray-800">{duty.name}</h4>
                      <p className="text-sm text-gray-600">{duty.description}</p>
                    </div>
                  ))}
              </div>

              {filteredDuties.filter(duty => !eventForm.selectedDuties.includes(duty.id)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy nhiệm vụ nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal chọn người dùng */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Chọn người dùng</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                {filteredUsers
                  .filter(user => !eventForm.selectedUsers.includes(user.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addUserToEvent(user.id)}
                    >
                      <h4 className="font-medium text-gray-800">{user.full_name}</h4>
                      <p className="text-sm text-gray-600">{user.academic_rank} - {user.academic_degree}</p>
                    </div>
                  ))}
              </div>

              {filteredUsers.filter(user => !eventForm.selectedUsers.includes(user.id)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy người dùng nào</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventManagement;