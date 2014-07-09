package com.xor10.x0webrtc;

/**
 * User: radu
 * Date: 7/7/14
 * Time: 3:36 PM
 */
public class Channel {

	private String id;
	private String token;

	public Channel(String id, String token) {
		this.id = id;
		this.token = token;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}
}
