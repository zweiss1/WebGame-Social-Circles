CREATE DATABASE  IF NOT EXISTS `social_circles_database` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `social_circles_database`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: social_circles_database
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `friendships`
--

DROP TABLE IF EXISTS `friendships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friendships` (
  `username` varchar(255) NOT NULL,
  `friend_username` varchar(255) NOT NULL,
  `status` enum('pending','accepted','blocked') DEFAULT 'accepted',
  PRIMARY KEY (`username`,`friend_username`),
  KEY `friend_username` (`friend_username`),
  CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`username`) REFERENCES `user_information` (`username`),
  CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`friend_username`) REFERENCES `user_information` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendships`
--

LOCK TABLES `friendships` WRITE;
/*!40000 ALTER TABLE `friendships` DISABLE KEYS */;
INSERT INTO `friendships` VALUES ('cheese','chase','blocked'),('DrHorn','ToddH','accepted'),('node','chase','accepted');
/*!40000 ALTER TABLE `friendships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_information`
--

DROP TABLE IF EXISTS `user_information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_information` (
  `username` varchar(255) NOT NULL,
  `hash_password` varchar(60) NOT NULL,
  `highscore` bigint DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `isAdmin` tinyint(1) DEFAULT '0',
  `darkMode` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_information`
--

LOCK TABLES `user_information` WRITE;
/*!40000 ALTER TABLE `user_information` DISABLE KEYS */;
INSERT INTO `user_information` VALUES ('aaaa','$2b$13$EnBgy6zfk/I/m2QDA23NP.467nA7gT2LldB26G6SDH.OW8VcSeUa.',0,1,0,0),('bill','$2b$13$wxaGuGmC47nE9U01BCf7nO0xSPMxp3xObPW6iUC.fy3uj9YVvSJIi',0,1,0,0),('bob','$2b$13$ajM.F5JK1gRIy0i4IaJvEeYKI4s3gJsxP5UM1flHYeHlPcOhTldWe',0,1,0,0),('chase','$2b$13$WLY6sl8QrJDMjZi63YV2ju9vpyk6Rq4YP988aYRJaMe5pE4AfKsgy',0,1,0,0),('cheese','$2b$13$HztvERJ6.q9ARQexhsVDQeATPE61SAdSDqOYSsjEQglk.kjPu899W',0,1,0,0),('DrHorn','sample_hashed_password2',150,1,0,0),('node','$2b$13$Yl0XKTmbyXqL6AMZGy.5DeVDc367JGjAhH96xRuLCnePH8Sw0BTuu',0,1,0,0),('ToddH','sample_hashed_password1',100,1,0,0);
/*!40000 ALTER TABLE `user_information` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02 17:31:27
