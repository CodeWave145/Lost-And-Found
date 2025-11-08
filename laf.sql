-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Nov 08, 2025 at 06:51 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `report`
--

CREATE TABLE `report` (
  `reportid` bigint(20) NOT NULL,
  `itemname` varchar(50) NOT NULL,
  `description` varchar(200) NOT NULL,
  `location` varchar(75) DEFAULT NULL,
  `isFound` tinyint(1) NOT NULL,
  `contact` varchar(11) DEFAULT NULL,
  `imgurl` varchar(512) DEFAULT NULL,
  `reportdate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report`
--

INSERT INTO `report` (`reportid`, `itemname`, `description`, `location`, `isFound`, `contact`, `imgurl`, `reportdate`) VALUES
(7, 'dbms book', 'blue', 'dbms lab', 1, '1234567890', 'https://res.cloudinary.com/dlg84lxvn/image/upload/v1762600845/mkq8jdnkxo70ucaxpnac.jpg', '2025-11-08 16:50:45'),
(8, 'water bottle', 'milton', 'bee lab', 1, '0987654321', 'https://res.cloudinary.com/dlg84lxvn/image/upload/v1762601370/lyyfqcgggix5tu2tqp9r.jpg', '2025-11-08 16:59:30'),
(9, 'blue bag', 'thor keychain', 'library', 0, '1231231231', NULL, '2025-11-08 17:42:17'),
(10, 'laptop', 'hp', 'library', 1, '1212121212', NULL, '2025-11-08 20:12:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `report`
--
ALTER TABLE `report`
  ADD PRIMARY KEY (`reportid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `report`
--
ALTER TABLE `report`
  MODIFY `reportid` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
