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
  floor: string | null;
  price?: number;
  beds: Bed[];
};

export default function InventoryManager({ listingId, initialRooms }: { listingId: number, initialRooms: Room[] }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("DOUBLE_SHARING");
  const [newRoomFloor, setNewRoomFloor] = useState("");
  const [newBedCount, setNewBedCount] = useState(2);
  const [newRoomPrice, setNewRoomPrice] = useState("");
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
          floor: newRoomFloor,
          bedCount: newBedCount,
          price: newRoomPrice
        })
      });

      if (!res.ok) throw new Error("Failed to add room");
      const newRoom = await res.json();
      setRooms([...rooms, newRoom]);
      setIsAddingRoom(false);
      setNewRoomName("");
      setNewRoomFloor("");
      setNewRoomPrice("");
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
          className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      {isAddingRoom && (
        <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 mb-6">
          <h3 className="font-semibold mb-4">Add New Room</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Room Name/Number</label>
              <input 
                type="text" 
                value={newRoomName} 
                onChange={e => setNewRoomName(e.target.value)} 
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
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
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none cursor-pointer"
              >
                <option value="SINGLE_ROOM">Single Room</option>
                <option value="DOUBLE_SHARING">Double Sharing</option>
                <option value="TRIPLE_SHARING">Triple Sharing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Floor</label>
              <input 
                type="text" 
                value={newRoomFloor} 
                onChange={e => setNewRoomFloor(e.target.value)} 
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                placeholder="e.g. 1st Floor" 
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Number of Beds</label>
              <input 
                type="number" 
                value={newBedCount} 
                onChange={e => setNewBedCount(parseInt(e.target.value))} 
                className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none" 
                min="1" max="10"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1 font-medium text-primary-700">Rent per Bed (₹/mo)</label>
              <input 
                type="number" 
                value={newRoomPrice} 
                onChange={e => setNewRoomPrice(e.target.value)} 
                className="w-full border border-primary-200 rounded-lg p-2.5 text-sm font-semibold text-primary-900 bg-primary-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all outline-none" 
                placeholder="e.g. 5000" 
                min="0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddRoom}
              disabled={loading}
              className="bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-600 transition flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Save Room
            </button>
            <button 
              onClick={() => setIsAddingRoom(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="text-center py-16 px-4 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <BedDouble size={32} className="text-neutral-300" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">No rooms added yet</h3>
          <p className="text-neutral-500 mb-6 max-w-sm">Setup your inventory by adding rooms. You can set the price and manage beds for each room.</p>
          <button 
            onClick={() => setIsAddingRoom(true)}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={18} /> Add Your First Room
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map(room => {
            const roomOccupied = room.beds.filter(b => b.isOccupied).length;
            const roomPct = room.beds.length > 0 ? Math.round((roomOccupied / room.beds.length) * 100) : 0;
            return (
            <div key={room.id} className="border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
              <div className="bg-gradient-to-r from-primary-50/50 to-white px-5 py-3 border-b border-neutral-100 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h4 className="font-bold text-neutral-900">{room.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">{room.type.replace('_', ' ')}</span>
                    {room.floor && <span className="text-xs text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">{room.floor}</span>}
                    {room.price !== undefined && room.price > 0 && <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">₹{room.price}/bed</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${roomPct === 100 ? "bg-red-500" : roomPct > 0 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${roomPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm bg-white px-3 py-1 rounded-full border border-neutral-200 whitespace-nowrap">
                    <span className="font-semibold text-primary-700">{roomOccupied}</span>
                    <span className="text-neutral-500"> / {room.beds.length} Occupied</span>
                  </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
