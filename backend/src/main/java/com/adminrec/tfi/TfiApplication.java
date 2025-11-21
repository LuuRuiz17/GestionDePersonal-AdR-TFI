package com.adminrec.tfi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

// El exclude es para evitar definir una DB ya, sin eso hace falta definir una DB para que el Backend pueda correr
@SpringBootApplication(/*exclude = { DataSourceAutoConfiguration.class }*/)
public class TfiApplication {
	public static void main(String[] args) {
		SpringApplication.run(TfiApplication.class, args);
	}
}
