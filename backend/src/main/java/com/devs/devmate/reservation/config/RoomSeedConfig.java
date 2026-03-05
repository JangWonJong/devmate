package com.devs.devmate.reservation.config;


import com.devs.devmate.reservation.entity.Room;
import com.devs.devmate.reservation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class RoomSeedConfig {

    private final RoomRepository roomRepository;

    @Bean
    CommandLineRunner seeRoom() {
        return args -> {
            if (roomRepository.count() == 0) {
                roomRepository.save(Room.builder().name("A룸").build());
                roomRepository.save(Room.builder().name("B룸").build());
                roomRepository.save(Room.builder().name("C룸").build());
                roomRepository.save(Room.builder().name("D룸").build());
                roomRepository.save(Room.builder().name("E룸").build());
            }
        };
    }

}
