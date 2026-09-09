package com.golfe1.gpi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableScheduling
@SpringBootApplication
public class GpiApplication {

    public static void main(String[] args) {
        SpringApplication.run(GpiApplication.class, args);
    }

}
