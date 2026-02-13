import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useApp } from '../context/AppContext';
import { format, isToday, isFuture } from 'date-fns';
import { Clock, Ban, CheckCircle, Users } from 'lucide-react';

interface AppointmentCalendarProps {
  doctorId?: string;
  isDoctor?: boolean;
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (timeSlot: string, date: string) => void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  doctorId = 'D001',
  isDoctor = false,
  onDateSelect,
  onTimeSlotSelect,
}) => {
  const {
    appointments,
    getDoctorAvailability,
    generateTimeSlots,
    blockTimeSlot,
    unblockTimeSlot,
    getAvailableTimeSlots,
    refreshAvailability,
    subscribeToAvailabilityUpdates,
  } = useApp();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // Get appointments for selected date
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const dayAppointments = appointments.filter(
    apt => apt.date === selectedDateString && apt.doctorId === doctorId
  );

  // Generate or get time slots for the selected date
  React.useEffect(() => {
    generateTimeSlots(doctorId, selectedDateString);
  }, [selectedDate, doctorId, generateTimeSlots, selectedDateString]);

  // Subscribe to real-time availability updates
  React.useEffect(() => {
    const unsubscribe = subscribeToAvailabilityUpdates((updatedDoctorId, updatedDate) => {
      // Only refresh if this component is viewing the same doctor and date
      if (updatedDoctorId === doctorId && updatedDate === selectedDateString) {
        // Force immediate re-render by refreshing availability
        refreshAvailability();
      }
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, [doctorId, selectedDateString, subscribeToAvailabilityUpdates, refreshAvailability]);

  const availability = getDoctorAvailability(doctorId, selectedDateString);
  const timeSlots = availability?.timeSlots || [];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Prevent selecting past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return; // Don't allow past date selection
      }
      
      setSelectedDate(date);
      onDateSelect?.(date);
    }
  };

  const handleBlockTime = () => {
    if (!blockStartTime || !blockEndTime) return;
    
    blockTimeSlot(doctorId, selectedDateString, blockStartTime, blockEndTime, blockReason);
    setShowBlockDialog(false);
    setBlockStartTime('');
    setBlockEndTime('');
    setBlockReason('');
    
    // Force an immediate UI refresh
    refreshAvailability();
  };

  const handleUnblockSlot = (slotId: string) => {
    unblockTimeSlot(doctorId, selectedDateString, slotId);
    
    // Force an immediate UI refresh
    refreshAvailability();
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    // Validate time is not in the past
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (selectedDateString === todayString) {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      if (timeSlot < currentTime) { // Changed from <= to <
        return; // Don't allow past time selection
      }
    }
    onTimeSlotSelect?.(timeSlot, selectedDateString);
  };

  // Get days with appointments for calendar highlighting
  const daysWithAppointments = appointments
    .filter(apt => apt.doctorId === doctorId && apt.status === 'Scheduled')
    .map(apt => new Date(apt.date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Appointment Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const checkDate = new Date(date);
              checkDate.setHours(0, 0, 0, 0);
              return checkDate < today;
            }}
            modifiers={{
              hasAppointments: daysWithAppointments,
              today: new Date(),
            }}
            modifiersStyles={{
              hasAppointments: {
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Time Slots and Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          {isDoctor && (
            <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Ban className="h-4 w-4 mr-2" />
                  Block Time
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Block Time Slot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={blockStartTime}
                        onChange={(e) => setBlockStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={blockEndTime}
                        onChange={(e) => setBlockEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for blocking this time..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBlockTime}>
                      Block Time
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {timeSlots.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No time slots available for this date
              </p>
            ) : (
              timeSlots.map((slot) => {
                const appointment = dayAppointments.find(apt => apt.time === slot.startTime);
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isPastTime = selectedDateString === todayString && (() => {
                  const now = new Date();
                  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                  return slot.startTime < currentTime; // Changed from <= to <
                })();
                
                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      slot.isBooked
                        ? 'bg-red-50 border-red-200'
                        : slot.isBlocked
                        ? 'bg-gray-50 border-gray-200'
                        : isPastTime
                        ? 'bg-gray-50 border-gray-300 opacity-50 cursor-not-allowed'
                        : 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!slot.isBooked && !slot.isBlocked && !isPastTime) {
                        handleTimeSlotSelect(slot.startTime);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      {slot.isBooked && appointment && (
                        <Badge variant="destructive">
                          {appointment.patientName}
                        </Badge>
                      )}
                      {slot.isBlocked && (
                        <Badge variant="secondary">
                          Blocked
                          {slot.blockReason && `: ${slot.blockReason}`}
                        </Badge>
                      )}
                      {!slot.isBooked && !slot.isBlocked && !isPastTime && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available
                        </Badge>
                      )}
                      {!slot.isBooked && !slot.isBlocked && isPastTime && (
                        <Badge variant="secondary" className="text-gray-600">
                          Past Time
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {slot.isBooked && <CheckCircle className="h-4 w-4 text-red-500" />}
                      {slot.isBlocked && (
                        <>
                          <Ban className="h-4 w-4 text-gray-500" />
                          {isDoctor && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnblockSlot(slot.id);
                              }}
                            >
                              Unblock
                            </Button>
                          )}
                        </>
                      )}
                      {!slot.isBooked && !slot.isBlocked && !isPastTime && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {!slot.isBooked && !slot.isBlocked && isPastTime && (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};