package com.xor10.x0webrtc;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 10:29 AM
 */
public class Member {

	private String id;
	private Channel channel;
	private Room room;

	public Member(String id) {
		this.id = id;
	}

	public Channel getChannel() {
		return channel;
	}

	public void setChannel(Channel channel) {
		this.channel = channel;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Room getRoom() {
		return room;
	}

	public void setRoom(Room room) {
		this.room = room;
	}
}
