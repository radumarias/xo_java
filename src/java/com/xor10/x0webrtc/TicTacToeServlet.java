package com.xor10.x0webrtc;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 11:31 AM
 */
public class TicTacToeServlet extends HttpServlet {

	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		String roomId = req.getParameter("roomId");

		Room room;
		if ((roomId != null) && !roomId.isEmpty()) {
			room = RoomsManager.getInstance().getRoom(roomId);

			if (room == null) {
				Util.writeError(resp, HttpServletResponse.SC_NOT_FOUND, "ROOM_DOESNT_EXISTS", String.format("Room [%s] doesn't exists.", roomId));

				return;
			}
		} else {
			room = RoomsManager.getInstance().createRoom();
		}

		Member member = new Member(room.generateMemberId());
		room.joinRoom(member);

		System.out.println("room.getId() = " + room.getId());
		System.out.println("member.getId() = " + member.getId());
		System.out.println("member.getChannel().getId() = " + member.getChannel().getId());
		System.out.println("member.getChannel().getToken() = " + member.getChannel().getToken());

		resp.setContentType("text/html");
		resp.getWriter().write(String.format("{token: '%s', channelId: '%s', roomId: '%s'}", member.getChannel().getToken(), member.getChannel().getId(), room.getId()));
	}
}
