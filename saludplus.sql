CREATE DATABASE  IF NOT EXISTS `saludplus` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `saludplus`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: saludplus
-- ------------------------------------------------------
-- Server version	9.3.0

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
-- Table structure for table `alertas`
--

DROP TABLE IF EXISTS `alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas` (
  `id_alerta` int unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('Stock Bajo','Vencimiento Próximo','Producto Vencido','Stock Agotado') COLLATE utf8mb4_general_ci NOT NULL,
  `id_producto` int unsigned NOT NULL,
  `id_lote` int unsigned DEFAULT NULL,
  `mensaje` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('Pendiente','Atendida','Ignorada') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente',
  `id_usuario_atiende` int unsigned DEFAULT NULL,
  `fecha_generacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_atencion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `fk_alerta_producto` (`id_producto`),
  KEY `fk_alerta_lote` (`id_lote`),
  KEY `idx_alertas_estado` (`estado`),
  CONSTRAINT `fk_alerta_lote` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`) ON UPDATE CASCADE,
  CONSTRAINT `fk_alerta_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
INSERT INTO `alertas` VALUES (1,'Vencimiento Próximo',3,3,'Diclofenaco 50mg - Lote LT-2024-003 vence el 20/07/2025 (menos de 90 días)','Atendida',3,'2026-05-02 17:54:39','2026-05-03 20:43:56'),(2,'Vencimiento Próximo',27,9,'Salbutamol Inhalador - Lote LT-2024-009 vence el 10/06/2025 (menos de 60 días)','Atendida',3,'2026-05-02 17:54:39','2026-05-03 20:43:55'),(3,'Stock Bajo',5,NULL,'Tramadol 50mg - Stock actual: 25 unidades (mínimo: 10). Reponer pronto.','Atendida',3,'2026-05-02 17:54:39','2026-05-03 20:43:53'),(4,'Stock Bajo',27,NULL,'Salbutamol Inhalador - Stock actual: 20 unidades (mínimo: 8). Reponer pronto.','Atendida',3,'2026-05-02 17:54:39','2026-05-03 20:43:51'),(5,'Producto Vencido',1,1,'Paracetamol 500mg x 10 tab — Lote LT-2024-001 venció el 2026-01-15','Atendida',1,'2026-05-03 21:15:28','2026-05-06 18:53:08'),(6,'Producto Vencido',2,2,'Ibuprofeno 400mg x 10 tab — Lote LT-2024-002 venció el 2026-02-10','Atendida',1,'2026-05-03 21:15:28','2026-05-06 18:53:10'),(7,'Producto Vencido',3,3,'Diclofenaco 50mg x 10 tab — Lote LT-2024-003 venció el 2025-07-20','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(8,'Producto Vencido',6,4,'Amoxicilina 500mg x 21 cap — Lote LT-2024-004 venció el 2026-03-01','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(9,'Producto Vencido',11,5,'Loratadina 10mg x 10 tab — Lote LT-2024-005 venció el 2026-04-10','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(10,'Producto Vencido',14,6,'Vitamina C 1000mg x 30 tab — Lote LT-2024-006 venció el 2026-02-05','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(11,'Producto Vencido',18,7,'Enalapril 10mg x 20 tab — Lote LT-2024-007 venció el 2026-03-15','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(12,'Producto Vencido',23,8,'Omeprazol 20mg x 14 cap — Lote LT-2024-008 venció el 2026-04-01','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(13,'Producto Vencido',27,9,'Salbutamol Inhalador 100mcg — Lote LT-2024-009 venció el 2025-06-10','Pendiente',NULL,'2026-05-03 21:15:28',NULL),(14,'Producto Vencido',32,10,'Gasa estéril 10x10 x10 unid — Lote LT-2024-010 venció el 2026-05-01','Pendiente',NULL,'2026-05-03 21:15:28',NULL);
/*!40000 ALTER TABLE `alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Analgésicos y Antiinflamatorios','Medicamentos para el dolor y la inflamación'),(2,'Antibióticos','Medicamentos para infecciones bacterianas'),(3,'Antihistamínicos','Medicamentos para alergias'),(4,'Vitaminas y Suplementos','Vitaminas, minerales y suplementos nutricionales'),(5,'Antihipertensivos','Medicamentos para la presión arterial'),(6,'Antidiabéticos','Medicamentos para la diabetes'),(7,'Gastrointestinales','Medicamentos para el sistema digestivo'),(8,'Respiratorios','Medicamentos para el sistema respiratorio'),(9,'Dermatológicos','Productos para la piel'),(10,'Material de Curación','Gasas, vendas, esparadrapos, etc.'),(11,'Productos de Higiene','Jabones, shampoo medicinales, etc.'),(12,'Oftalmológicos','Colirios y productos para los ojos');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` int unsigned NOT NULL AUTO_INCREMENT,
  `tipo_doc` enum('DNI','RUC','CE','Pasaporte') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'DNI',
  `num_doc` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_nac` date DEFAULT NULL,
  `puntos` int unsigned NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uk_cliente_doc` (`tipo_doc`,`num_doc`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'DNI','00000000','Cliente','General',NULL,NULL,NULL,NULL,0,'2026-05-02 17:54:39'),(2,'DNI','45321876','María','González Huerta','987654321','maria.g@gmail.com',NULL,NULL,0,'2026-05-02 17:54:39'),(3,'DNI','32145698','Pedro','Sánchez López','954123789','psanchez@hotmail.com',NULL,NULL,0,'2026-05-02 17:54:39'),(4,'DNI','67891234','Elena','Torres Vargas','941238765',NULL,NULL,NULL,0,'2026-05-02 17:54:39'),(5,'DNI','12345678','Juan','Pérez Mamani','963258741','juanp@gmail.com',NULL,NULL,0,'2026-05-02 17:54:39'),(6,'RUC','20601234567','Farmacia del Pueblo SAC','SAC','(01)2234567','compras@farmapueblo.pe',NULL,NULL,0,'2026-05-02 17:54:39');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `clave` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `valor` text COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES ('alerta_vencimiento_dias','90','Días de anticipación para alerta de vencimiento'),('botica_direccion','Av. Los Olivos 1234, Lima','Dirección'),('botica_email','contacto@novasalud.pe','Email de contacto'),('botica_nombre','Nova Salud','Nombre de la botica'),('botica_ruc','10456789012','RUC del negocio'),('botica_telefono','(01) 456-7890','Teléfono'),('correlativo_boleta','11','Correlativo actual de boletas'),('correlativo_factura','1','Correlativo actual de facturas'),('correlativo_ticket','1','Correlativo para comprobantes tipo Ticket'),('igv_porcentaje','18','Porcentaje de IGV'),('serie_boleta','B001','Serie de boletas'),('serie_factura','F001','Serie de facturas');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ordenes_compra`
--

DROP TABLE IF EXISTS `detalle_ordenes_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ordenes_compra` (
  `id_detalle` int unsigned NOT NULL AUTO_INCREMENT,
  `id_orden` int unsigned NOT NULL,
  `id_producto` int unsigned NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_doc_orden` (`id_orden`),
  KEY `fk_doc_producto` (`id_producto`),
  CONSTRAINT `fk_doc_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_compra` (`id_orden`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_doc_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ordenes_compra`
--

LOCK TABLES `detalle_ordenes_compra` WRITE;
/*!40000 ALTER TABLE `detalle_ordenes_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_ordenes_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ventas` (
  `id_detalle` int unsigned NOT NULL AUTO_INCREMENT,
  `id_venta` int unsigned NOT NULL,
  `id_producto` int unsigned NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_venta` (`id_venta`),
  KEY `fk_detalle_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
INSERT INTO `detalle_ventas` VALUES (1,1,1,3,1.20,0.00,3.60),(2,1,11,5,1.00,0.00,5.00),(3,1,23,1,0.80,0.00,0.80),(4,2,6,1,10.00,0.00,10.00),(5,2,14,1,7.00,0.00,7.00),(6,2,16,1,6.00,0.00,6.00),(7,3,7,3,12.00,0.00,36.00),(8,3,8,3,8.00,0.00,24.00),(9,3,23,5,2.50,0.00,12.50),(10,3,35,3,4.50,0.00,13.50),(11,4,2,2,1.80,0.00,3.60),(12,4,24,3,2.00,0.00,6.00),(13,4,28,2,2.50,0.00,5.00),(14,4,34,1,3.00,0.00,3.00),(15,5,18,1,3.50,0.00,3.50),(16,5,21,1,4.50,0.00,4.50),(17,5,23,2,2.50,0.00,5.00),(18,5,15,1,18.00,0.00,18.00),(19,10,34,1,3.00,0.00,3.00),(20,10,22,1,3.50,0.00,3.50),(21,11,37,1,9.00,0.00,9.00),(22,11,22,1,3.50,0.00,3.50),(23,11,32,1,2.50,0.00,2.50),(24,12,35,1,4.50,0.00,4.50),(25,12,32,1,2.50,0.00,2.50),(26,13,34,1,3.00,0.00,3.00),(27,13,30,1,7.00,0.00,7.00),(28,13,6,1,10.00,0.00,10.00),(29,13,1,1,1.20,0.00,1.20),(30,14,35,1,4.50,0.00,4.50),(31,14,14,1,7.00,0.00,7.00),(32,14,33,1,3.50,0.00,3.50),(33,14,34,1,3.00,0.00,3.00),(34,14,1,1,1.20,0.00,1.20),(35,15,1,1,1.20,0.00,1.20),(36,16,34,1,3.00,0.00,3.00),(37,17,1,1,1.20,0.00,1.20);
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotes` (
  `id_lote` int unsigned NOT NULL AUTO_INCREMENT,
  `id_producto` int unsigned NOT NULL,
  `numero_lote` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_fabricacion` date DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_actual` int NOT NULL,
  `precio_compra` decimal(10,2) NOT NULL,
  `id_proveedor` int unsigned NOT NULL,
  `id_usuario` int unsigned NOT NULL COMMENT 'Quién ingresó el lote',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lote`),
  KEY `fk_lotes_producto` (`id_producto`),
  KEY `fk_lotes_proveedor` (`id_proveedor`),
  KEY `fk_lotes_usuario` (`id_usuario`),
  KEY `idx_lotes_vencimiento` (`fecha_vencimiento`),
  CONSTRAINT `fk_lotes_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_lotes_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON UPDATE CASCADE,
  CONSTRAINT `fk_lotes_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,1,'LT-2024-001','2024-01-15','2026-01-15',200,120,0.50,1,2,'2026-05-02 17:54:39'),(2,2,'LT-2024-002','2024-02-10','2026-02-10',150,85,0.80,1,2,'2026-05-02 17:54:39'),(3,3,'LT-2024-003','2024-01-20','2025-07-20',100,60,0.60,2,2,'2026-05-02 17:54:39'),(4,6,'LT-2024-004','2024-03-01','2026-03-01',100,45,4.50,4,2,'2026-05-02 17:54:39'),(5,11,'LT-2024-005','2024-04-10','2026-04-10',150,90,0.40,2,2,'2026-05-02 17:54:39'),(6,14,'LT-2024-006','2024-02-05','2026-02-05',200,100,3.00,1,2,'2026-05-02 17:54:39'),(7,18,'LT-2024-007','2024-03-15','2026-03-15',120,65,1.50,5,2,'2026-05-02 17:54:39'),(8,23,'LT-2024-008','2024-04-01','2026-04-01',200,90,1.00,5,2,'2026-05-02 17:54:39'),(9,27,'LT-2024-009','2024-01-10','2025-06-10',40,20,10.00,4,2,'2026-05-02 17:54:39'),(10,32,'LT-2024-010','2024-05-01','2026-05-01',150,75,1.00,4,2,'2026-05-02 17:54:39'),(11,14,'LT-2026-05','2025-10-20','2028-10-20',5,5,50.00,4,1,'2026-05-03 22:08:15'),(12,14,'LT-025612','2025-11-12','2026-11-20',50,50,500.00,2,1,'2026-05-06 18:54:27');
/*!40000 ALTER TABLE `lotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id_movimiento` int unsigned NOT NULL AUTO_INCREMENT,
  `id_producto` int unsigned NOT NULL,
  `id_lote` int unsigned DEFAULT NULL,
  `tipo` enum('Entrada','Salida','Ajuste','Devolución') COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int NOT NULL,
  `stock_nuevo` int NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_venta` int unsigned DEFAULT NULL COMMENT 'Si el movimiento es por venta',
  `id_usuario` int unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_mov_producto` (`id_producto`),
  KEY `fk_mov_lote` (`id_lote`),
  KEY `fk_mov_venta` (`id_venta`),
  KEY `fk_mov_usuario` (`id_usuario`),
  KEY `idx_movimientos_fecha` (`fecha_hora`),
  CONSTRAINT `fk_mov_lote` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`) ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_venta` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
INSERT INTO `movimientos_inventario` VALUES (1,34,NULL,'Salida',1,60,59,'Venta',10,1,'2026-05-03 20:03:43'),(2,22,NULL,'Salida',1,35,34,'Venta',10,1,'2026-05-03 20:03:43'),(3,37,NULL,'Salida',1,35,34,'Venta',11,1,'2026-05-03 20:05:48'),(4,22,NULL,'Salida',1,34,33,'Venta',11,1,'2026-05-03 20:05:48'),(5,32,NULL,'Salida',1,75,74,'Venta',11,1,'2026-05-03 20:05:48'),(6,35,NULL,'Salida',1,80,79,'Venta',12,1,'2026-05-03 20:10:31'),(7,32,NULL,'Salida',1,74,73,'Venta',12,1,'2026-05-03 20:10:31'),(8,34,NULL,'Salida',1,59,58,'Venta',13,1,'2026-05-03 20:16:42'),(9,30,NULL,'Salida',1,35,34,'Venta',13,1,'2026-05-03 20:16:42'),(10,6,NULL,'Salida',1,45,44,'Venta',13,1,'2026-05-03 20:16:42'),(11,1,NULL,'Salida',1,120,119,'Venta',13,1,'2026-05-03 20:16:42'),(12,35,NULL,'Salida',1,79,78,'Venta',14,1,'2026-05-03 20:33:01'),(13,14,NULL,'Salida',1,100,99,'Venta',14,1,'2026-05-03 20:33:01'),(14,33,NULL,'Salida',1,50,49,'Venta',14,1,'2026-05-03 20:33:01'),(15,34,NULL,'Salida',1,58,57,'Venta',14,1,'2026-05-03 20:33:01'),(16,1,NULL,'Salida',1,119,118,'Venta',14,1,'2026-05-03 20:33:01'),(17,1,NULL,'Salida',1,118,117,'Venta',15,1,'2026-05-03 20:33:35'),(18,34,NULL,'Salida',1,57,56,'Venta',16,3,'2026-05-03 21:17:05'),(19,14,11,'Entrada',5,99,104,'Ingreso de lote',NULL,1,'2026-05-03 22:08:15'),(20,18,NULL,'Devolución',1,65,66,'Anulación de venta',5,1,'2026-05-03 22:20:12'),(21,21,NULL,'Devolución',1,50,51,'Anulación de venta',5,1,'2026-05-03 22:20:12'),(22,23,NULL,'Devolución',2,90,92,'Anulación de venta',5,1,'2026-05-03 22:20:12'),(23,15,NULL,'Devolución',1,55,56,'Anulación de venta',5,1,'2026-05-03 22:20:12'),(24,1,NULL,'Salida',1,117,116,'Venta',17,1,'2026-05-06 18:51:46'),(25,14,12,'Entrada',50,104,154,'Ingreso de lote',NULL,1,'2026-05-06 18:54:27');
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_compra`
--

DROP TABLE IF EXISTS `ordenes_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_compra` (
  `id_orden` int unsigned NOT NULL AUTO_INCREMENT,
  `numero_orden` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `id_proveedor` int unsigned NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_entrega` date DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` enum('Pendiente','Enviada','Recibida','Cancelada') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente',
  `observacion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_usuario` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_orden`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `fk_oc_proveedor` (`id_proveedor`),
  KEY `fk_oc_usuario` (`id_usuario`),
  CONSTRAINT `fk_oc_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON UPDATE CASCADE,
  CONSTRAINT `fk_oc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_compra`
--

LOCK TABLES `ordenes_compra` WRITE;
/*!40000 ALTER TABLE `ordenes_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int unsigned NOT NULL AUTO_INCREMENT,
  `codigo_barras` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre_generico` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `principio_activo` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `presentacion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tableta, Jarabe, Ampolla, etc.',
  `concentracion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '500mg, 250mg/5ml, etc.',
  `unidad_medida` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Unidad',
  `precio_compra` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio_venta` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_actual` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '10' COMMENT 'Umbral para alerta de reposición',
  `stock_maximo` int NOT NULL DEFAULT '200',
  `id_categoria` int unsigned NOT NULL,
  `id_proveedor` int unsigned NOT NULL,
  `requiere_receta` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`),
  KEY `fk_productos_categoria` (`id_categoria`),
  KEY `fk_productos_proveedor` (`id_proveedor`),
  KEY `idx_productos_nombre` (`nombre`),
  KEY `idx_productos_principio` (`principio_activo`),
  CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON UPDATE CASCADE,
  CONSTRAINT `fk_productos_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'7751021001','Paracetamol 500mg x 10 tab','Paracetamol','Paracetamol','Tableta','500mg','Blíster',0.50,1.20,116,20,300,1,1,0,1,'2026-05-02 17:54:39','2026-05-06 18:51:46'),(2,'7751021002','Ibuprofeno 400mg x 10 tab','Ibuprofeno','Ibuprofeno','Tableta','400mg','Blíster',0.80,1.80,85,20,250,1,1,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(3,'7751021003','Diclofenaco 50mg x 10 tab','Diclofenaco','Diclofenaco sód.','Tableta','50mg','Blíster',0.60,1.50,60,15,200,1,2,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(4,'7751021004','Ketorolaco 10mg x 10 tab','Ketorolaco','Ketorolaco','Tableta','10mg','Blíster',1.20,2.80,30,10,150,1,2,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(5,'7751021005','Tramadol 50mg x 10 cap','Tramadol','Tramadol HCl','Cápsula','50mg','Blíster',2.00,4.50,25,10,100,1,3,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(6,'7751021006','Amoxicilina 500mg x 21 cap','Amoxicilina','Amoxicilina','Cápsula','500mg','Caja',4.50,10.00,44,15,200,2,4,1,1,'2026-05-02 17:54:39','2026-05-03 20:16:42'),(7,'7751021007','Azitromicina 500mg x 3 tab','Azitromicina','Azitromicina','Tableta','500mg','Caja',5.00,12.00,38,10,150,2,4,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(8,'7751021008','Ciprofloxacino 500mg x 12 tab','Ciprofloxacino','Ciprofloxacino','Tableta','500mg','Caja',3.50,8.00,50,15,200,2,5,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(9,'7751021009','Amoxicilina + Ac. Clav 500/125mg','Amoxiclav','Amox+Clav','Tableta','500/125mg','Unidad',7.00,16.00,3,5,100,2,1,1,1,'2026-05-02 17:54:39','2026-05-04 20:10:36'),(10,'7751021010','Metronidazol 500mg x 14 tab','Metronidazol','Metronidazol','Tableta','500mg','Caja',2.00,5.00,40,10,150,2,5,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(11,'7751021011','Loratadina 10mg x 10 tab','Loratadina','Loratadina','Tableta','10mg','Blíster',0.40,1.00,90,20,300,3,2,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(12,'7751021012','Cetirizina 10mg x 10 tab','Cetirizina','Cetirizina HCl','Tableta','10mg','Blíster',0.50,1.20,70,15,250,3,2,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(13,'7751021013','Dexclorfeniramina 2mg Jarabe','Dexclorfeniramina','Dexclorfeniramina','Jarabe','2mg/5ml','Frasco',4.00,9.00,25,10,100,3,3,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(14,'7751021014','Vitamina C 1000mg x 30 tab','Vitamina C','Ácido Ascórbico','Tableta','1000mg','Caja',3.00,7.00,154,25,400,4,1,0,1,'2026-05-02 17:54:39','2026-05-06 18:54:27'),(15,'7751021015','Vitamina D3 5000 UI x 30 cap','Vitamina D3','Colecalciferol','Cápsula','5000 UI','Frasco',8.00,18.00,56,15,200,4,2,0,1,'2026-05-02 17:54:39','2026-05-03 22:20:12'),(16,'7751021016','Complejo B x 30 tab','Complejo B','B1+B6+B12','Tableta','Compuesta','Caja',2.50,6.00,80,20,300,4,3,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(17,'7751021017','Omega 3 1000mg x 60 cap','Omega 3','Aceite de pescado','Cápsula','1000mg','Frasco',9.00,20.00,40,10,150,4,4,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(18,'7751021018','Enalapril 10mg x 20 tab','Enalapril','Enalapril maleat.','Tableta','10mg','Caja',1.50,3.50,66,20,250,5,5,1,1,'2026-05-02 17:54:39','2026-05-03 22:20:12'),(19,'7751021019','Losartán 50mg x 30 tab','Losartán','Losartán potásico','Tableta','50mg','Caja',3.00,7.00,55,15,200,5,1,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(20,'7751021020','Amlodipino 5mg x 30 tab','Amlodipino','Amlodipino besil.','Tableta','5mg','Caja',2.50,6.00,45,15,200,5,2,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(21,'7751021021','Metformina 850mg x 30 tab','Metformina','Metformina HCl','Tableta','850mg','Caja',2.00,4.50,51,15,200,6,3,1,1,'2026-05-02 17:54:39','2026-05-03 22:20:12'),(22,'7751021022','Glibenclamida 5mg x 30 tab','Glibenclamida','Glibenclamida','Tableta','5mg','Caja',1.50,3.50,33,10,150,6,4,1,1,'2026-05-02 17:54:39','2026-05-03 20:05:48'),(23,'7751021023','Omeprazol 20mg x 14 cap','Omeprazol','Omeprazol','Cápsula','20mg','Caja',1.00,2.50,92,25,350,7,5,0,1,'2026-05-02 17:54:39','2026-05-03 22:20:12'),(24,'7751021024','Ranitidina 150mg x 20 tab','Ranitidina','Ranitidina HCl','Tableta','150mg','Caja',0.80,2.00,70,20,300,7,1,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(25,'7751021025','Bismuto Subsalicilato 262mg','Pepto-Bismol','Bismuto subsalic.','Tableta','262mg','Caja',2.50,6.00,40,10,150,7,2,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(26,'7751021026','Metoclopramida 10mg x 10 tab','Metoclopramida','Metoclopramida','Tableta','10mg','Blíster',0.50,1.20,60,15,250,7,3,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(27,'7751021027','Salbutamol Inhalador 100mcg','Salbutamol','Salbutamol sulfat.','Inhalador','100mcg/d','Unidad',10.00,22.00,20,8,80,8,4,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(28,'7751021028','Ambroxol 30mg x 20 tab','Ambroxol','Ambroxol HCl','Tableta','30mg','Caja',1.00,2.50,55,15,200,8,5,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(29,'7751021029','Mucosolvan Jarabe 30mg/5ml','Ambroxol Jarabe','Ambroxol HCl','Jarabe','30mg/5ml','Frasco',6.00,14.00,30,10,120,8,1,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(30,'7751021030','Betametasona Crema 0.05%','Betametasona','Betametasona val.','Crema','0.05%','Tubo',3.00,7.00,34,10,150,9,2,1,1,'2026-05-02 17:54:39','2026-05-03 20:16:42'),(31,'7751021031','Clotrimazol Crema 1%','Clotrimazol','Clotrimazol','Crema','1%','Tubo',2.50,6.00,40,10,150,9,3,0,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(32,'7751021032','Gasa estéril 10x10 x10 unid','Gasa estéril',NULL,'Unidad','10x10cm','Paquete',1.00,2.50,73,20,300,10,4,0,1,'2026-05-02 17:54:39','2026-05-03 20:10:31'),(33,'7751021033','Esparadrapo tela 2.5cm x 5m','Esparadrapo',NULL,'Rollo','2.5x500cm','Unidad',1.50,3.50,49,15,200,10,5,0,1,'2026-05-02 17:54:39','2026-05-03 20:33:01'),(34,'7751021034','Agua Oxigenada 3% x 500ml','Agua Oxigenada','H2O2','Frasco','3%','Unidad',1.20,3.00,56,15,250,10,1,0,1,'2026-05-02 17:54:39','2026-05-04 20:05:01'),(35,'7751021035','Alcohol 70° x 500ml','Alcohol Isopropíl','Alcohol isopropíl.','Frasco','70°','Frasco',2.00,4.50,78,20,300,10,2,0,1,'2026-05-02 17:54:39','2026-05-03 20:33:01'),(36,'7751021036','Tobramicina colirio 0.3%','Tobramicina','Tobramicina','Colirio','0.3%','Frasco',5.00,12.00,20,8,80,12,3,1,1,'2026-05-02 17:54:39','2026-05-02 17:54:39'),(37,'7751021037','Lágrimas artificiales x 15ml','Lágrimas artif.','Hialuronato sód.','Solución','0.18%','Frasco',4.00,9.00,34,10,150,12,4,0,1,'2026-05-02 17:54:39','2026-05-03 20:05:48');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int unsigned NOT NULL AUTO_INCREMENT,
  `razon_social` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `ruc` char(11) COLLATE utf8mb4_general_ci NOT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `ruc` (`ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'Laboratorios Portugal S.A.','20100478523','Ana Suárez','(01) 619-9000','ventas@labportugal.pe','Av. Argentina 3210, Callao',1,'2026-05-02 17:54:39'),(2,'Química Suiza S.A.','20100015014','Jorge Lira','(01) 613-5000','ventas@quimicasuiza.pe','Av. Aramburú 450, Surquillo',1,'2026-05-02 17:54:39'),(3,'Distribuidora Médica DIMED S.A.','20511311702','Rosa Chávez','(01) 433-7070','dimed@dimed.com.pe','Jr. Paruro 812, Lima',1,'2026-05-02 17:54:39'),(4,'Farmindustria S.A.','20100070970','Luis Herrera','(01) 612-6000','ventas@farmindustria.pe','Av. Venezuela 1707, Lima',1,'2026-05-02 17:54:39'),(5,'Medifarma S.A.','20100039207','Carmen Ríos','(01) 618-4000','ventas@medifarma.com.pe','Av. Universitaria 2390, Lima',1,'2026-05-02 17:54:39');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema'),(2,'Cajero','Registro de ventas y atención al cliente'),(4,'Administrador','Acceso total al sistema'),(5,'Cajero','Acceso a ventas, clientes y consulta de productos');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int unsigned NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'bcrypt hash',
  `id_rol` int unsigned NOT NULL,
  `permisos_extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT 'Permisos adicionales otorgados por el Admin (solo aplica a Cajeros)',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuarios_rol` (`id_rol`),
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE,
  CONSTRAINT `usuarios_chk_1` CHECK (json_valid(`permisos_extra`))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Carlos','Torres','admin@novasalud.pe','$2a$10$20Tuaw2s3AJMNHzQo85pvulsBy6mGHpF8WKcVNZcDvxCLLrD7fYfG',1,NULL,1,'2026-05-02 17:54:39','2026-05-04 19:39:23'),(2,'Lucía','Ramírez Flores','farmacia@novasalud.pe','$2a$10$20Tuaw2s3AJMNHzQo85pvulsBy6mGHpF8WKcVNZcDvxCLLrD7fYfG',2,NULL,0,'2026-05-02 17:54:39','2026-05-03 21:56:20'),(3,'Miguel','Vega','caja1@novasalud.pe','$2a$10$20Tuaw2s3AJMNHzQo85pvulsBy6mGHpF8WKcVNZcDvxCLLrD7fYfG',2,NULL,1,'2026-05-02 17:54:39','2026-05-04 19:39:39'),(4,'Señor','Ayuwoki','caja2@novasalud.pe','$2a$10$20Tuaw2s3AJMNHzQo85pvulsBy6mGHpF8WKcVNZcDvxCLLrD7fYfG',2,NULL,1,'2026-05-02 17:54:39','2026-05-04 19:38:54'),(5,'Roberto','Huanca Llanos','farmacia2@novasalud.pe','$2a$10$20Tuaw2s3AJMNHzQo85pvulsBy6mGHpF8WKcVNZcDvxCLLrD7fYfG',2,NULL,0,'2026-05-02 17:54:39','2026-05-03 21:56:17');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_lotes_por_vencer`
--

DROP TABLE IF EXISTS `v_lotes_por_vencer`;
/*!50001 DROP VIEW IF EXISTS `v_lotes_por_vencer`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_lotes_por_vencer` AS SELECT 
 1 AS `id_lote`,
 1 AS `numero_lote`,
 1 AS `producto`,
 1 AS `fecha_vencimiento`,
 1 AS `dias_para_vencer`,
 1 AS `cantidad_actual`,
 1 AS `proveedor`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_productos_mas_vendidos`
--

DROP TABLE IF EXISTS `v_productos_mas_vendidos`;
/*!50001 DROP VIEW IF EXISTS `v_productos_mas_vendidos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_productos_mas_vendidos` AS SELECT 
 1 AS `id_producto`,
 1 AS `nombre`,
 1 AS `categoria`,
 1 AS `total_vendido`,
 1 AS `ingresos_totales`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_stock_bajo`
--

DROP TABLE IF EXISTS `v_stock_bajo`;
/*!50001 DROP VIEW IF EXISTS `v_stock_bajo`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_stock_bajo` AS SELECT 
 1 AS `id_producto`,
 1 AS `codigo_barras`,
 1 AS `nombre`,
 1 AS `stock_actual`,
 1 AS `stock_minimo`,
 1 AS `unidades_faltantes`,
 1 AS `categoria`,
 1 AS `proveedor`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_ventas_diarias`
--

DROP TABLE IF EXISTS `v_ventas_diarias`;
/*!50001 DROP VIEW IF EXISTS `v_ventas_diarias`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_ventas_diarias` AS SELECT 
 1 AS `fecha`,
 1 AS `total_ventas`,
 1 AS `monto_total`,
 1 AS `total_descuentos`,
 1 AS `cajero`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id_venta` int unsigned NOT NULL AUTO_INCREMENT,
  `serie` char(4) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'B001',
  `correlativo` int unsigned NOT NULL,
  `tipo_comprobante` enum('Boleta','Factura','Ticket') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Ticket',
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `igv` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tipo_pago` enum('Efectivo','Tarjeta','Yape','Plin','Transferencia') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Efectivo',
  `monto_pagado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `vuelto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `id_cliente` int unsigned NOT NULL DEFAULT '1',
  `id_usuario` int unsigned NOT NULL,
  `observacion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('Completada','Anulada','Pendiente') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Completada',
  PRIMARY KEY (`id_venta`),
  UNIQUE KEY `uk_venta_comprobante` (`serie`,`correlativo`),
  KEY `fk_ventas_cliente` (`id_cliente`),
  KEY `fk_ventas_usuario` (`id_usuario`),
  KEY `idx_ventas_fecha` (`fecha_hora`),
  KEY `idx_ventas_estado` (`estado`),
  CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,'B001',1,'Boleta','2025-04-01 09:15:00',9.40,1.69,0.00,9.40,'Efectivo',10.00,0.60,2,3,NULL,'Completada'),(2,'B001',2,'Boleta','2025-04-01 10:30:00',22.00,3.96,2.00,20.00,'Yape',20.00,0.00,3,3,NULL,'Completada'),(3,'F001',1,'Factura','2025-04-02 11:00:00',85.00,15.30,5.00,80.00,'Transferencia',80.00,0.00,6,4,NULL,'Completada'),(4,'B001',3,'Boleta','2025-04-03 08:45:00',15.50,2.79,0.00,15.50,'Tarjeta',15.50,0.00,4,3,NULL,'Completada'),(5,'B001',4,'Boleta','2025-04-05 14:20:00',31.00,5.58,1.00,30.00,'Efectivo',30.00,0.00,5,4,NULL,'Anulada'),(10,'B001',5,'Boleta','2026-05-03 20:03:43',6.50,1.17,0.00,6.50,'Efectivo',10.00,3.50,1,1,'','Completada'),(11,'B001',6,'Boleta','2026-05-03 20:05:48',15.00,2.70,0.00,15.00,'Efectivo',18.00,3.00,1,1,'','Completada'),(12,'B001',7,'Boleta','2026-05-03 20:10:31',7.00,1.26,0.00,7.00,'Efectivo',20.00,13.00,1,1,'','Completada'),(13,'B001',8,'Boleta','2026-05-03 20:16:42',21.20,3.82,0.00,21.20,'Efectivo',25.00,3.80,1,1,'','Completada'),(14,'B001',9,'Boleta','2026-05-03 20:33:01',19.20,3.46,0.00,19.20,'Efectivo',20.00,0.80,1,1,'','Completada'),(15,'B001',10,'Boleta','2026-05-03 20:33:35',1.20,0.22,0.00,1.20,'Efectivo',5.00,3.80,4,1,'','Completada'),(16,'T001',1,'Ticket','2026-05-03 21:17:05',3.00,0.54,0.00,3.00,'Efectivo',50.00,47.00,1,3,'','Completada'),(17,'B001',11,'Boleta','2026-05-06 18:51:46',1.20,0.22,0.00,1.20,'Efectivo',5.00,3.80,4,1,'','Completada');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `v_lotes_por_vencer`
--

/*!50001 DROP VIEW IF EXISTS `v_lotes_por_vencer`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_lotes_por_vencer` AS select `l`.`id_lote` AS `id_lote`,`l`.`numero_lote` AS `numero_lote`,`p`.`nombre` AS `producto`,`l`.`fecha_vencimiento` AS `fecha_vencimiento`,(to_days(`l`.`fecha_vencimiento`) - to_days(curdate())) AS `dias_para_vencer`,`l`.`cantidad_actual` AS `cantidad_actual`,`pr`.`razon_social` AS `proveedor` from ((`lotes` `l` join `productos` `p` on((`l`.`id_producto` = `p`.`id_producto`))) join `proveedores` `pr` on((`l`.`id_proveedor` = `pr`.`id_proveedor`))) where (`l`.`cantidad_actual` > 0) order by `l`.`fecha_vencimiento` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_productos_mas_vendidos`
--

/*!50001 DROP VIEW IF EXISTS `v_productos_mas_vendidos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_productos_mas_vendidos` AS select `p`.`id_producto` AS `id_producto`,`p`.`nombre` AS `nombre`,`c`.`nombre` AS `categoria`,sum(`dv`.`cantidad`) AS `total_vendido`,sum(`dv`.`subtotal`) AS `ingresos_totales` from (((`detalle_ventas` `dv` join `productos` `p` on((`dv`.`id_producto` = `p`.`id_producto`))) join `categorias` `c` on((`p`.`id_categoria` = `c`.`id_categoria`))) join `ventas` `v` on((`dv`.`id_venta` = `v`.`id_venta`))) where (`v`.`estado` = 'Completada') group by `p`.`id_producto`,`p`.`nombre`,`c`.`nombre` order by sum(`dv`.`cantidad`) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_stock_bajo`
--

/*!50001 DROP VIEW IF EXISTS `v_stock_bajo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_stock_bajo` AS select `p`.`id_producto` AS `id_producto`,`p`.`codigo_barras` AS `codigo_barras`,`p`.`nombre` AS `nombre`,`p`.`stock_actual` AS `stock_actual`,`p`.`stock_minimo` AS `stock_minimo`,(`p`.`stock_minimo` - `p`.`stock_actual`) AS `unidades_faltantes`,`c`.`nombre` AS `categoria`,`pr`.`razon_social` AS `proveedor` from ((`productos` `p` join `categorias` `c` on((`p`.`id_categoria` = `c`.`id_categoria`))) join `proveedores` `pr` on((`p`.`id_proveedor` = `pr`.`id_proveedor`))) where ((`p`.`stock_actual` <= `p`.`stock_minimo`) and (`p`.`activo` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_ventas_diarias`
--

/*!50001 DROP VIEW IF EXISTS `v_ventas_diarias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_ventas_diarias` AS select cast(`v`.`fecha_hora` as date) AS `fecha`,count(`v`.`id_venta`) AS `total_ventas`,sum(`v`.`total`) AS `monto_total`,sum(`v`.`descuento`) AS `total_descuentos`,concat(`u`.`nombres`,' ',`u`.`apellidos`) AS `cajero` from (`ventas` `v` join `usuarios` `u` on((`v`.`id_usuario` = `u`.`id_usuario`))) where (`v`.`estado` = 'Completada') group by cast(`v`.`fecha_hora` as date),`v`.`id_usuario` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 21:24:07
