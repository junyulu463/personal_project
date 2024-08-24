package com.backend.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;

public class DateUtils {
    /**
     * Converts a date string to java.sql.Date.
     *
     * @param dateString the date string in yyyy-MM-dd format.
     * @return the corresponding java.sql.Date.
     * @throws IllegalArgumentException if the date format is invalid.
     */
    public static java.sql.Date convertStringToSqlDate(String dateString) {
        try {
            // Ensure the date string is in the correct format
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            java.util.Date utilDate = dateFormat.parse(dateString);
            return new java.sql.Date(utilDate.getTime());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateString, e);
        }
    }

    /**
     * Converts a date-time string to java.sql.Timestamp.
     * @param dateTimeString the date-time string in yyyy-MM-dd HH:mm:ss format.
     * @return the corresponding java.sql.Timestamp.
     * @throws IllegalArgumentException if the date format is invalid.
     */
    public static java.sql.Timestamp convertStringToTimestamp(String dateTimeString) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            java.util.Date parsedDate = dateFormat.parse(dateTimeString);
            return new java.sql.Timestamp(parsedDate.getTime());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateTimeString, e);
        }
    }
}