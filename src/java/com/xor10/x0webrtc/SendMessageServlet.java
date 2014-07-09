package com.xor10.x0webrtc;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 11:31 AM
 */
public class SendMessageServlet extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String fromChannelId = req.getParameter("fromChannelId");

		System.out.println("fromChannelId = " + fromChannelId);

		String message = Util.getBody(req);
		System.out.println("message = " + message);

		ChannelManager.getInstance().sendToOthers(fromChannelId, message);
	}
}
