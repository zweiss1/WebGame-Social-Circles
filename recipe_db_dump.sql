CREATE DATABASE  IF NOT EXISTS `recipe_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `recipe_db`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: recipe_db
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
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `origin` text,
  `safety_tips` text,
  `fun_fact` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
INSERT INTO `ingredients` VALUES (1,'Chicken Breast','Global','Cook to 165°F','Most popular protein worldwide'),(2,'Soy Sauce','China','Contains gluten','Invented 3,000 years ago'),(3,'Salmon','North Atlantic/Pacific','Cook to 145°F internal temperature','Contains more omega-3 fatty acids than most other fish'),(4,'Garlic','Central Asia','Store at room temperature in dry area','Has been used medicinally for over 5,000 years'),(5,'Olive Oil','Mediterranean','Store away from light and heat','Extra virgin has the highest antioxidant content'),(6,'Bell Pepper','Central/South America','Wash thoroughly before use','Green peppers are unripe red peppers'),(7,'Ground Beef','Global','Cook to 160°F internal temperature','Chuck has the ideal fat ratio for burgers'),(8,'Rice','Asia','Rinse until water runs clear before cooking','Over 40,000 varieties exist worldwide'),(9,'Tomato','South America','Store at room temperature for best flavor','Botanically a fruit, not a vegetable'),(10,'Onion','Central Asia','Cut root side last to reduce tears','Contains more sugar than strawberries'),(11,'Ginger','Southeast Asia','Peel with spoon edge for minimal waste','Can be stored in freezer for up to 6 months'),(12,'Cumin','Middle East','Toast before grinding for enhanced flavor','One of the most used spices after black pepper'),(13,'Shrimp','Global Coastlines','Devein before cooking','Can change gender during their lifecycle'),(14,'Lemon','Southeast Asia','Roll firmly before juicing for maximum yield','Contains more sugar than strawberries'),(15,'Pasta','Italy','Salt water heavily before cooking','Over 600 shapes exist worldwide'),(16,'Mushrooms','Global','Clean with damp cloth instead of washing','More genetically similar to humans than plants'),(17,'Honey','Global','Never give to infants under 12 months','Only food that never spoils'),(18,'Avocado','Central America','Store with pit to reduce browning','Technically a single-seeded berry'),(19,'Coconut Milk','Southeast Asia','Shake well before using','Contains medium-chain fatty acids that boost metabolism'),(20,'Cilantro','Mediterranean','Add at end of cooking to preserve flavor','Tastes like soap to 4-14% of population due to genetics'),(21,'Black Beans','South America','Soak overnight to reduce cooking time','Contains more protein than any other bean variety'),(22,'Quinoa','South America','Rinse thoroughly to remove bitter coating','One of few plant foods with complete protein'),(23,'Tofu','China','Press between paper towels before cooking','Has been made for over 2,000 years'),(24,'Maple Syrup','North America','Refrigerate after opening','Takes 40 gallons of sap to make 1 gallon of syrup'),(25,'Cheddar Cheese','England','Bring to room temperature before serving','Traditional varieties are aged in caves'),(26,'Basil','India','Store in water like cut flowers','Member of the mint family'),(27,'Ground Turkey','North America','Cook to 165°F internal temperature','Contains less saturated fat than beef'),(28,'Pork Tenderloin','Global','Cook to 145°F with 3-minute rest','Leanest cut of pork available'),(29,'Chickpeas','Middle East','Save cooking liquid for egg substitute','One of the earliest cultivated legumes'),(30,'Kale','Mediterranean','Massage with oil to tenderize','Contains more vitamin C than oranges');
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `recipe_id` int DEFAULT NULL,
  `ingredient_id` int DEFAULT NULL,
  KEY `recipe_id` (`recipe_id`),
  KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`),
  CONSTRAINT `recipe_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_ingredients`
--

LOCK TABLES `recipe_ingredients` WRITE;
/*!40000 ALTER TABLE `recipe_ingredients` DISABLE KEYS */;
INSERT INTO `recipe_ingredients` VALUES (1,1),(1,2),(2,2);
/*!40000 ALTER TABLE `recipe_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `protein_type` enum('Chicken','Beef','Grains','Fish','Beans','Eggs') NOT NULL,
  `instructions` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,'Teriyaki Chicken','Chicken','1. Marinate chicken\n2. Grill until cooked'),(2,'Fish and Soy Sauce without the fish','Fish','1. Grill Fish on the stove\r\n2. Pour soy sauce on top\r\n3. Remove the fish');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-02 20:54:40
