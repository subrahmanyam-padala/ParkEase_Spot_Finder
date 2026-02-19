package com.parkeasy.ParkEase_backend.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class QrCodeGenerator {

	/**
	 * Generates a QR Code image file and saves it to the specified path.
	 *
	 * @param data   The information to encode inside the QR code
	 * @param path   The file path where the PNG should be saved
	 * @param width  The width of the generated image
	 * @param height The height of the generated image
	 * @throws WriterException If ZXing fails to encode the data
	 * @throws IOException     If there is an error writing the file to disk
	 */
	public static void generateQRCode(String data, String path, int width, int height)
			throws WriterException, IOException {

		Map<EncodeHintType, Object> hints = new HashMap<>();
		hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
		hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

		BitMatrix matrix = new MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, width, height, hints);

		Path outputPath = new File(path).toPath();
		MatrixToImageWriter.writeToPath(matrix, "PNG", outputPath);

		System.out.println("QR Code generated successfully at " + path);
	}
}