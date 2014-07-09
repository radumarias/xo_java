package com.xor10.x0webrtc;

import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * User: radu
 * Date: 7/7/14
 * Time: 3:35 PM
 */
public class ChannelManager {

	private static ChannelManager ourInstance = new ChannelManager();

	private Map<String, Member> channelMemberMap = new HashMap<String, Member>();

	public static ChannelManager getInstance() {
		return ourInstance;
	}

	private ChannelManager() {
	}

	/**
	 * @param channelId
	 * @return
	 */
	public Channel createChannel(String channelId) {
		ChannelService channelService = ChannelServiceFactory.getChannelService();

		String token = channelService.createChannel(channelId);

		Channel channel = new Channel(channelId, token);

		return channel;
	}

	public Map<String, Member> getChannelMemberMap() {
		return channelMemberMap;
	}

	/**
	 *
	 * @param channelId
	 * @param message
	 */
	public void sendMessage(String channelId, String message) {
		ChannelService channelService = ChannelServiceFactory.getChannelService();

		channelService.sendMessage(new ChannelMessage(channelId, message));
	}

	/**
	 *
	 * @param fromChannelId
	 * @param message
	 */
	public void sendToOthers(String fromChannelId, String message) {
		Member from = ChannelManager.getInstance().getChannelMemberMap().get(fromChannelId);
		for (Member other : from.getRoom().getOthers(from)) {
			System.out.println(String.format("send message to user [%s]", other.getId()));

			ChannelManager.getInstance().sendMessage(other.getChannel().getId(), message);
		}

	}
}
