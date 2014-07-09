package com.xor10.x0webrtc;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;

/**
 * User: radu
 * Date: 7/5/14
 * Time: 2:29 PM
 */
public class Util {

	/**
	 * @param request
	 * @return
	 * @throws IOException
	 */
	public static String getBody(HttpServletRequest request) throws IOException {
		StringBuffer jb = new StringBuffer();
		String line;
		try {
			BufferedReader reader = request.getReader();
			while ((line = reader.readLine()) != null)
				jb.append(line);
		} catch (IOException e) {
			throw e;
		}

		return jb.toString();
	}

	/**
	 *
	 * @param roomId
	 * @param memberId
	 * @return
	 */
	public static final String generateChannelId(String roomId, String memberId) {
		return String.format("%s-%s", roomId, memberId);
	}
}
