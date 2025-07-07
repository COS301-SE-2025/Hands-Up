import os
import numpy as np
import random
from scipy import interpolate
from scipy.ndimage import gaussian_filter1d

class AdvancedSignLanguageAugmentor:
    """
    Advanced augmentation specifically designed for small sign language datasets.
    Generates more diverse and realistic variations.
    """
    
    def __init__(self, sequence_length=30):
        self.sequence_length = sequence_length
    
    def temporal_masking(self, sequence, mask_ratio=0.15):
        """Randomly mask parts of the temporal sequence."""
        seq_len = len(sequence)
        mask_length = int(seq_len * mask_ratio)
        start_idx = random.randint(0, seq_len - mask_length)
        
        masked_seq = sequence.copy()
        # Replace masked region with interpolated values
        if start_idx > 0 and start_idx + mask_length < seq_len:
            for i in range(sequence.shape[1]):
                start_val = sequence[start_idx - 1, i]
                end_val = sequence[start_idx + mask_length, i]
                masked_seq[start_idx:start_idx + mask_length, i] = np.linspace(
                    start_val, end_val, mask_length)
        
        return masked_seq
    
    def keypoint_dropout(self, sequence, dropout_ratio=0.1):
        """Randomly set some keypoints to zero (simulate occlusion)."""
        masked_seq = sequence.copy()
        num_keypoints = sequence.shape[1]
        num_to_mask = int(num_keypoints * dropout_ratio)
        
        for frame_idx in range(len(sequence)):
            if random.random() < 0.3:  # 30% chance per frame
                keypoints_to_mask = random.sample(range(num_keypoints), 
                                                num_to_mask)
                masked_seq[frame_idx, keypoints_to_mask] = 0
        
        return masked_seq
    
    def mixup_sequences(self, seq1, seq2, alpha=0.3):
        """Mix two sequences together (mixup augmentation)."""
        lam = np.random.beta(alpha, alpha)
        mixed_seq = lam * seq1 + (1 - lam) * seq2
        return mixed_seq
    
    def elastic_deformation(self, sequence, alpha=0.1, sigma=0.05):
        """Apply elastic deformation to keypoints."""
        deformed_seq = sequence.copy()
        
        for i in range(sequence.shape[1]):
            if i % 2 == 0:  # x coordinates
                noise = np.random.normal(0, sigma, len(sequence))
                smooth_noise = gaussian_filter1d(noise, sigma=2)
                deformed_seq[:, i] += alpha * smooth_noise
        
        return deformed_seq
    
    def perspective_transform(self, sequence, strength=0.1):
        """Simulate perspective changes."""
        transformed_seq = sequence.copy()
        
        # Random perspective parameters
        perspective_factor = np.random.uniform(-strength, strength)
        
        for frame_idx in range(len(sequence)):
            for i in range(0, sequence.shape[1], 2):  # x,y pairs
                if i + 1 < sequence.shape[1]:
                    x, y = sequence[frame_idx, i], sequence[frame_idx, i + 1]
                    # Simple perspective transformation
                    transformed_seq[frame_idx, i] = x + y * perspective_factor
        
        return transformed_seq
    
    def generate_aggressive_augmentations(self, sequence, num_augmentations=8):
        """Generate multiple diverse augmentations from a single sequence."""
        augmentations = []
        
        # Define augmentation strategies
        strategies = [
            lambda seq: self.add_noise(seq, noise_factor=0.03),
            lambda seq: self.time_warp(seq, sigma=0.3),
            lambda seq: self.speed_change(seq, speed_factor=np.random.uniform(0.7, 1.3)),
            lambda seq: self.spatial_transform(seq, translation_range=0.08, scale_range=0.15),
            lambda seq: self.rotation_2d(seq, max_angle=20),
            lambda seq: self.temporal_masking(seq),
            lambda seq: self.keypoint_dropout(seq),
            lambda seq: self.elastic_deformation(seq),
            lambda seq: self.perspective_transform(seq),
            lambda seq: self.smooth_sequence(seq, sigma=1.5),
        ]
        
        # Generate combinations
        for i in range(num_augmentations):
            aug_seq = sequence.copy()
            
            # Apply 1-3 random augmentations
            num_ops = random.randint(1, 3)
            selected_ops = random.sample(strategies, num_ops)
            
            for op in selected_ops:
                try:
                    aug_seq = op(aug_seq)
                except:
                    continue  # Skip if augmentation fails
            
            # Ensure sequence is still valid
            if not np.isnan(aug_seq).any() and not np.isinf(aug_seq).any():
                augmentations.append(aug_seq)
        
        return augmentations
    
    # Include all methods from original augmentor
    def add_noise(self, sequence, noise_factor=0.02):
        noise = np.random.normal(0, noise_factor, sequence.shape)
        return sequence + noise
    
    def time_warp(self, sequence, sigma=0.2):
        seq_len = len(sequence)
        random_warps = np.random.normal(loc=1.0, scale=sigma, size=(seq_len,))
        random_warps = np.cumsum(random_warps)
        random_warps = random_warps / random_warps[-1] * (seq_len - 1)
        
        original_indices = np.arange(seq_len)
        warped_sequence = np.zeros_like(sequence)
        
        for i in range(sequence.shape[1]):
            f = interpolate.interp1d(original_indices, sequence[:, i], 
                                   kind='linear', bounds_error=False, fill_value='extrapolate')
            warped_sequence[:, i] = f(random_warps)
            
        return warped_sequence
    
    def speed_change(self, sequence, speed_factor=None):
        if speed_factor is None:
            speed_factor = np.random.uniform(0.8, 1.2)
        
        original_length = len(sequence)
        new_length = int(original_length * speed_factor)
        
        original_indices = np.linspace(0, original_length - 1, original_length)
        new_indices = np.linspace(0, original_length - 1, new_length)
        
        resampled_sequence = np.zeros((new_length, sequence.shape[1]))
        
        for i in range(sequence.shape[1]):
            f = interpolate.interp1d(original_indices, sequence[:, i], 
                                   kind='linear', bounds_error=False, fill_value='extrapolate')
            resampled_sequence[:, i] = f(new_indices)
        
        if new_length < self.sequence_length:
            padding = np.tile(resampled_sequence[-1], (self.sequence_length - new_length, 1))
            resampled_sequence = np.vstack([resampled_sequence, padding])
        elif new_length > self.sequence_length:
            resampled_sequence = resampled_sequence[:self.sequence_length]
            
        return resampled_sequence
    
    def spatial_transform(self, sequence, translation_range=0.05, scale_range=0.1):
        tx = np.random.uniform(-translation_range, translation_range)
        ty = np.random.uniform(-translation_range, translation_range)
        scale = np.random.uniform(1 - scale_range, 1 + scale_range)
        
        transformed = sequence.copy()
        
        for i in range(0, sequence.shape[1], 2):
            if i + 1 < sequence.shape[1]:
                transformed[:, i] = (sequence[:, i] + tx) * scale
                transformed[:, i + 1] = (sequence[:, i + 1] + ty) * scale
        
        return transformed
    
    def rotation_2d(self, sequence, max_angle=15):
        angle = np.random.uniform(-max_angle, max_angle) * np.pi / 180
        cos_angle = np.cos(angle)
        sin_angle = np.sin(angle)
        
        rotated = sequence.copy()
        
        for i in range(0, sequence.shape[1], 2):
            if i + 1 < sequence.shape[1]:
                x = sequence[:, i]
                y = sequence[:, i + 1]
                
                rotated[:, i] = x * cos_angle - y * sin_angle
                rotated[:, i + 1] = x * sin_angle + y * cos_angle
        
        return rotated
    
    def smooth_sequence(self, sequence, sigma=1.0):
        smoothed = np.zeros_like(sequence)
        for i in range(sequence.shape[1]):
            smoothed[:, i] = gaussian_filter1d(sequence[:, i], sigma=sigma)
        return smoothed

def super_augment_dataset(input_path, output_path, target_samples_per_action=100):
    """
    Super aggressive augmentation to reach target samples per action.
    """
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    
    augmentor = AdvancedSignLanguageAugmentor()
    
    print(f"🚀 SUPER AUGMENTATION MODE")
    print(f"🎯 Target: {target_samples_per_action} samples per action")
    print("-" * 60)
    
    for action in os.listdir(input_path):
        action_input_path = os.path.join(input_path, action)
        
        if not os.path.isdir(action_input_path):
            continue
        
        action_output_path = os.path.join(output_path, action)
        os.makedirs(action_output_path, exist_ok=True)
        
        # Get original files
        npy_files = [f for f in os.listdir(action_input_path) if f.endswith('.npy')]
        original_count = len(npy_files)
        
        if original_count == 0:
            continue
        
        print(f"🎬 {action}: {original_count} original files")
        
        # Calculate how many augmentations needed per file
        augmentations_per_file = max(1, target_samples_per_action // original_count)
        
        total_generated = 0
        
        for npy_file in npy_files:
            file_path = os.path.join(action_input_path, npy_file)
            
            try:
                sequence = np.load(file_path)
                base_name = os.path.splitext(npy_file)[0]
                
                # Save original
                original_output = os.path.join(action_output_path, npy_file)
                np.save(original_output, sequence)
                total_generated += 1
                
                # Generate aggressive augmentations
                augmentations = augmentor.generate_aggressive_augmentations(
                    sequence, num_augmentations=augmentations_per_file
                )
                
                for i, aug_seq in enumerate(augmentations):
                    aug_filename = f"{base_name}_superaug_{i:03d}.npy"
                    aug_path = os.path.join(action_output_path, aug_filename)
                    np.save(aug_path, aug_seq)
                    total_generated += 1
                
            except Exception as e:
                print(f"  ❌ Error with {npy_file}: {e}")
        
        print(f"  ✅ Generated {total_generated} samples")
    
    print("✅ Super augmentation completed!")

# Usage example
if __name__ == "__main__":
    # For small datasets, generate 100+ samples per action
    super_augment_dataset(
        input_path='dataset',
        output_path='D:\capstone\super_augmented_dataset', 
        target_samples_per_action=100
    )