import React, { useState, useEffect } from 'react'; // Correct import
import axios from 'axios';
import ComplaintBox from './ComplaintBox';
import { useNavigate } from 'react-router-dom';

const Complaint = () => {
  const [complaints, setComplaints] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    closedComplaints: 0,
    pendingComplaints: 0,
    droppedComplaints: 0,
    resolvedComplaints: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaintCounts = async () => {
      const userId = localStorage.getItem('userId');
      console.log('Fetching complaint counts for user ID:', userId);
      try {
        const response = await axios.get(
          `http://localhost:5044/api/UserDashboard/complaints/${userId}`
        );
        console.log('Response received:', response.data);
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaint counts', error);
      }
    };

    fetchComplaintCounts();
  }, []);

  const handleViewDetails = (status) => {
    navigate('/dashboard/complaint', { state: { selectedStatus: status } });
  };

  return (
    <div className="flex justify-center items-start bg-white rounded-lg m-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ComplaintBox
          number={complaints.totalComplaints}
          title="TotalComplaints"
          onClick={() => handleViewDetails('TotalComplaints')}
        />
        <ComplaintBox
          number={complaints.openComplaints}
          title="OpenComplaints"
          onClick={() => handleViewDetails('OpenComplaints')}
        />
        <ComplaintBox
          number={complaints.closedComplaints}
          title="ClosedComplaints"
          onClick={() => handleViewDetails('ClosedComplaints')}
        />
        <ComplaintBox
          number={complaints.pendingComplaints}
          title="PendingComplaints"
          onClick={() => handleViewDetails('PendingComplaints')}
        />
        <ComplaintBox
          number={complaints.droppedComplaints}
          title="DroppedComplaints"
          onClick={() => handleViewDetails('DroppedComplaints')}
        />
        <ComplaintBox
          number={complaints.resolvedComplaints}
          title="ResolvedComplaints"
          onClick={() => handleViewDetails('ResolvedComplaints')}
        />
      </div>
    </div>
  );
};

export default Complaint;
