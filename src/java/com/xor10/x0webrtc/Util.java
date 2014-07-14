package com.xor10.x0webrtc;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 2:29 PM
 */
public class Util {

	private Util() {
	}

	/**
	 * @param request
	 * @return
	 * @throws IOException
	 */
	public static String getBody(HttpServletRequest request) throws IOException {
		StringBuilder sb = new StringBuilder();
		String line;
		try {
			BufferedReader reader = request.getReader();
			while ((line = reader.readLine()) != null) {
				sb.append(line);
			}
		} catch (IOException e) {
			throw e;
		}

		return sb.toString();
	}

	/**
	 * @param roomId
	 * @param memberId
	 * @return
	 */
	public static String generateChannelId(String roomId, String memberId) {
		return String.format("%s-%s", roomId, memberId);
	}

	/**
	 * @param resp
	 * @param errorCode
	 * @param message
	 * @throws IOException
	 */
	public static void writeError(HttpServletResponse resp, int httpCode, String errorCode, String message) throws IOException {
		resp.setStatus(httpCode);
		resp.setContentType("text/html");
		resp.getWriter().write(String.format("{ error: { code: %s, message: '%s' } }", errorCode, message));
	}
}
