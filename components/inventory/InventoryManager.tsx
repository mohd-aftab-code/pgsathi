"use client";

import { useState } from "react";
import { Plus, User, BedDouble, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Bed = {
  id: number;
  name: string;
  isOccupied: boolean;
};

type Room = {
  id: number;
  name: string;
  type: string;
  beds: Bed[];
};

export default function InventoryManager({ listingId, initialRooms }: { listingId: number, initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("DOUBLE_SHARING");
  const [newBedCount, setNewBedCount] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleAddRoom = async () => {
    if (!newRoomName) return toast.error("Room name is required");
    
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          name: newRoomName,
          type: newRoomType,
          bedCount: newBedCount
        })
      });

      if (!res.ok) throw new Error("Failed to add room");
      const newRoom = await res.json();
      setRooms([...rooms, newRoom]);
      setIsAddingRoom(false);
      setNewRoomName("");
      toast.success("Room added successfully");
    } catch (error) {
      toast.error("Could not add room");
    } finally {
      setLoading(false);
    }
  };

  const toggleBedStatus = async (roomId: number, bedId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistic update
      setRooms(rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            beds: room.beds.map(bed => bed.id === bedId ? { ...bed, isOccupied: newStatus } : bed)
          };
        }
        return room;
      }));

      const res = await fetch("/api/inventory/beds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bedId, isOccupied: newStatus })
      });

      if (!res.ok) throw new Error("Failed");
      toast.success(newStatus ? "Bed marked as Occupied" : "Bed marked as Vacant");
    } catch (error) {
      toast.error("Could not update bed status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">Rooms & Beds</h2>
        <button 
          onClick={() => setIsAddingRoom(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      {isAddingRoom && (
        <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 mb-6">
          <h3 className="font-semibold mb-4">Add New Room</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Room Name/Number</label>
              <input 
                type="text" 
                value={newRoomName} 
                onChange={e => setNewRoomName(e.target.value)} 
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm" 
                placeholder="e.g. Room 101" 
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sharing Type</label>
              <select 
                value={newRoomType} 
                onChange={e => {
                  setNewRoomType(e.target.value);
                  if(e.target.value === "SINGLE_ROOM") setNewBedCount(1);
                  if(e.target.value === "DOUBLE_SHARING") setNewBedCount(2);
                  if(e.target.value === "TRIPLE_SHARING") setNewBedCount(3);
                }}
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm bg-white"
              >
                <option value="SINGLE_ROOM">Single Room</option>
                <option value="DOUBLE_SHARING">Double Sharing</option>
                <option value="TRIPLE_SHARING">Triple Sharing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Number of Beds</label>
              <input 
                type="number" 
                value={newBedCount} 
                onChange={e => setNewBedCount(parseInt(e.target.value))} 
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm" 
                min="1" max="10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAddRoom} 
              disabled={loading}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Room
            </button>
            <button 
              onClick={() => setIsAddingRoom(false)} 
              className="px-5 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="text-center py-10 text-neutral-500 border border-dashed border-neutral-300 rounded-xl bg-neutral-50">
          No rooms added yet. Click "Add Room" to setup your inventory.
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map(room => (
            <div key={room.id} className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-neutral-900">{room.name}</h4>
                  <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">{room.type.replace('_', ' ')}</span>
                </div>
                <div className="text-sm bg-white px-3 py-1 rounded-full border border-neutral-200">
                  <span className="font-semibold text-primary-700">{room.beds.filter(b => b.isOccupied).length}</span>
                  <span className="text-neutral-500"> / {room.beds.length} Occupied</span>
                </div>
              </div>
              
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                {room.beds.map(bed => (
                  <div 
                    key={bed.id} 
                    onClick={() => toggleBedStatus(room.id, bed.id, bed.isOccupied)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      bed.isOccupied 
                        ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300' 
                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300'
                    }`}
                  >
                    {bed.isOccupied ? <User size={28} /> : <BedDouble size={28} />}
                    <span className="font-bold text-sm">{bed.name}</span>
                    <span className="text-xs font-medium uppercase tracking-wider opacity-80">{bed.isOccupied ? 'Occupied' : 'Vacant'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
