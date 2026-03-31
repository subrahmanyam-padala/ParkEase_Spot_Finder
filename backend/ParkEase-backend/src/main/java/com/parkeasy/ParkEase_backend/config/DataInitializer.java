package com.parkeasy.ParkEase_backend.config;

import com.parkeasy.ParkEase_backend.entity.ParkingSpot;
import com.parkeasy.ParkEase_backend.entity.PricingConfig;
import com.parkeasy.ParkEase_backend.repository.ParkingSpotRepository;
import com.parkeasy.ParkEase_backend.repository.PricingConfigRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

	private final ParkingSpotRepository parkingSpotRepository;
	private final PricingConfigRepository pricingConfigRepository;

	public DataInitializer(ParkingSpotRepository parkingSpotRepository,
			PricingConfigRepository pricingConfigRepository) {
		this.parkingSpotRepository = parkingSpotRepository;
		this.pricingConfigRepository = pricingConfigRepository;
	}

	@Override
	public void run(String... args) {
		// Only seed if DB is empty
		if (parkingSpotRepository.count() == 0) {
			System.out.println("[DataInitializer] Seeding parking spots...");

			// Ground Floor - Regular spots
			String[][] groundFloor = {
					{ "A1", "Ground Floor", "false", "Enter main gate, turn right. Spot A1 on your left." },
					{ "A2", "Ground Floor", "false", "Enter main gate, turn right. Spot A2 next to A1." },
					{ "A3", "Ground Floor", "false", "Enter main gate, turn right. Walk past A2, spot A3 ahead." },
					{ "A4", "Ground Floor", "false", "Enter main gate, continue straight to spot A4." },
					{ "A5", "Ground Floor", "false", "Enter main gate, continue straight past A4 to A5." },
					{ "A6", "Ground Floor", "true", "Enter main gate, turn left. EV charging station at A6." },
					{ "A7", "Ground Floor", "true", "Enter main gate, turn left past A6. EV station at A7." }, };

			// Level 1 - Regular spots
			String[][] level1 = {
					{ "B1", "Level 1", "false", "Take elevator/ramp to Level 1. Turn left, spot B1 on right." },
					{ "B2", "Level 1", "false", "Take elevator/ramp to Level 1. Turn left past B1, spot B2." },
					{ "B3", "Level 1", "false", "Take elevator/ramp to Level 1. Straight ahead, spot B3." },
					{ "B4", "Level 1", "false", "Take elevator/ramp to Level 1. Straight ahead past B3, spot B4." },
					{ "B5", "Level 1", "false", "Take elevator/ramp to Level 1. Turn right to spot B5." },
					{ "B6", "Level 1", "false", "Take elevator/ramp to Level 1. Turn right past B5 to spot B6." }, };

			// Level 2 - Premium
			String[][] level2 = {
					{ "C1", "Premium Level", "false", "Take elevator to Level 2 (Premium). Turn left to C1." },
					{ "C2", "Premium Level", "false", "Take elevator to Level 2 (Premium). Left past C1 to C2." },
					{ "C3", "Premium Level", "true", "Take elevator to Level 2 (Premium). EV spot C3 on right." },
					{ "C4", "Premium Level", "false", "Take elevator to Level 2 (Premium). Straight to C4." },
					{ "C5", "Premium Level", "false", "Take elevator to Level 2 (Premium). End of row, spot C5." }, };

			// Rooftop
			String[][] rooftop = {
					{ "D1", "Rooftop", "false", "Take elevator to Rooftop. Open area, spot D1 near entrance." },
					{ "D2", "Rooftop", "false", "Take elevator to Rooftop. Spot D2 next to D1." },
					{ "D3", "Rooftop", "false", "Take elevator to Rooftop. Spot D3 in middle section." },
					{ "D4", "Rooftop", "false", "Take elevator to Rooftop. Spot D4 far end." }, };

			seedSpots(groundFloor);
			seedSpots(level1);
			seedSpots(level2);
			seedSpots(rooftop);

			System.out.println("[DataInitializer] " + parkingSpotRepository.count() + " parking spots seeded.");
		}

		// Seed default pricing if not exists
		if (pricingConfigRepository.count() == 0) {
			PricingConfig config = new PricingConfig(50.0, 80, 1.5);
			pricingConfigRepository.save(config);
			System.out
					.println("[DataInitializer] Default pricing config seeded: ₹50/hr, surge at 80%, 1.5x multiplier");
		}
	}

	private void seedSpots(String[][] spots) {
		for (String[] s : spots) {
			ParkingSpot spot = new ParkingSpot(s[0], s[1], Boolean.parseBoolean(s[2]), s[3]);
			parkingSpotRepository.save(spot);
		}
	}
}
