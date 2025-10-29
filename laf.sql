-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2025 at 05:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laf`
--
CREATE DATABASE IF NOT EXISTS `laf` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `laf`;

-- --------------------------------------------------------

--
-- Table structure for table `found`
--

DROP TABLE IF EXISTS `found`;
CREATE TABLE `found` (
  `found_id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `phone_no` varchar(20) NOT NULL,
  `f_date` date DEFAULT NULL,
  `is_found` tinyint(1) DEFAULT NULL,
  `user_id` varchar(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lost`
--

DROP TABLE IF EXISTS `lost`;
CREATE TABLE `lost` (
  `lost_id` int(11) NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `location` varchar(200) NOT NULL,
  `phone_no` varchar(10) NOT NULL,
  `l_date` date NOT NULL,
  `is_found` tinyint(1) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `user_id` varchar(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` varchar(11) NOT NULL,
  `phone_no` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `found`
--
ALTER TABLE `found`
  ADD PRIMARY KEY (`found_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `lost`
--
ALTER TABLE `lost`
  ADD PRIMARY KEY (`lost_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `found`
--
ALTER TABLE `found`
  ADD CONSTRAINT `found_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `lost`
--
ALTER TABLE `lost`
  ADD CONSTRAINT `lost_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
