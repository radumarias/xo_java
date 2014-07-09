package com.xor10.x0webrtc;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 10:28 AM
 */
public class Room {

	private AtomicLong idGenerator = new AtomicLong();

	private String id;

	private Set<Member> members = new HashSet<Member>();

	public Room(String id) {
		this.id = id;
	}

	public void joinRoom(Member member) {
		member.setRoom(this);

		Channel channel = ChannelManager.getInstance().createChannel(Util.generateChannelId(id, member.getId()));
		member.setChannel(channel);

		ChannelManager.getInstance().getChannelMemberMap().put(channel.getId(), member);

		members.add(member);

		String message = String.format("{ type: 'PRESENCE', value: 'IN', memberId: '%s' }", member.getId());
		ChannelManager.getInstance().sendToOthers(member.getChannel().getId(), message);
	}

	public void leaveRoom(Member member) {
		ChannelManager.getInstance().getChannelMemberMap().remove(member.getChannel().getId());

		members.remove(member);
	}

	/**
	 * @return
	 */
	public String generateMemberId() {
		return String.valueOf(idGenerator.incrementAndGet());
	}

	public String getId() {
		return id;
	}

	/**
	 * @param member
	 * @return
	 */
	public Set<Member> getOthers(Member member) {
		Set<Member> others = new HashSet<Member>(members.size() - 1);

		for (Member other : members) {
			if (!other.getId().equals(member.getId())) {
				others.add(other);
			}
		}

		return others;
	}
}
