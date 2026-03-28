package com.parkeasy.ParkEase_backend.security;

import com.parkeasy.ParkEase_backend.entity.AdminUser;
import com.parkeasy.ParkEase_backend.entity.Users;
import com.parkeasy.ParkEase_backend.repository.AdminUserRepository;
import com.parkeasy.ParkEase_backend.repository.UsersRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private static final String ADMIN_TOKEN_PREFIX = "ADMIN::";

	private final UsersRepository usersRepository;
	private final AdminUserRepository adminUserRepository;

	public CustomUserDetailsService(UsersRepository usersRepository, AdminUserRepository adminUserRepository) {
		this.usersRepository = usersRepository;
		this.adminUserRepository = adminUserRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		if (username != null && username.startsWith(ADMIN_TOKEN_PREFIX)) {
			String adminId = username.substring(ADMIN_TOKEN_PREFIX.length());
			AdminUser admin = adminUserRepository.findByAdminId(adminId)
					.orElseThrow(() -> new UsernameNotFoundException("Admin not found with admin ID: " + adminId));

			return new User(username, admin.getPassword(), List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
		}

		Users user = usersRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

		String role = user.getRole() != null ? user.getRole() : "USER";
		return new User(user.getUsername(), user.getPassword(),
				List.of(new SimpleGrantedAuthority("ROLE_" + role)));
	}
}
