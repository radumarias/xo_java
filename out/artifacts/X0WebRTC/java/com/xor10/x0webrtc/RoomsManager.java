package com.xor10.x0webrtc;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 10:28 AM
 */
public class RoomsManager {

	private static final RoomsManager ourInstance = new RoomsManager();

	private AtomicLong idGenerator = new AtomicLong();

	private Map<String, Room> rooms = new HashMap<String, Room>();

	public static RoomsManager getInstance() {
		return ourInstance;
	}

	public Room createRoom() {
		Room room = new Room(String.valueOf(idGenerator.incrementAndGet()));

		rooms.put(room.getId(), room);

		return room;
	}

	/**
	 *
	 * @param id
	 * @return
	 */
	public Room getRoom(String id) {
		return rooms.get(id);
	}
}
