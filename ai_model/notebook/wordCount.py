import os
import shutil
from collections import Counter

def count_videos_in_action(action_path):
    """
    Count the number of videos in a specific action folder.
    
    Args:
        action_path (str): Path to the action folder
    
    Returns:
        int: Number of video files in the folder
    """
    video_extensions = ('.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv')
    
    if not os.path.exists(action_path):
        return 0
    
    video_count = 0
    for file_name in os.listdir(action_path):
        if file_name.lower().endswith(video_extensions):
            video_count += 1
    
    return video_count

def filter_and_copy_dataset(source_path, destination_path, min_videos=10):
    """
    Filter dataset to only include actions with minimum number of videos and copy to new location.
    
    Args:
        source_path (str): Path to the original dataset
        destination_path (str): Path where filtered dataset will be copied
        min_videos (int): Minimum number of videos required for an action to be included
    """
    # Create destination directory if it doesn't exist
    if not os.path.exists(destination_path):
        os.makedirs(destination_path)
        print(f"✅ Created destination directory: {destination_path}")
    
    # Check if source path exists
    if not os.path.exists(source_path):
        print(f"❌ Error: Source path '{source_path}' does not exist!")
        return
    
    print(f"🔍 Analyzing dataset at: {source_path}")
    print(f"📁 Filtered dataset will be saved to: {destination_path}")
    print(f"🎯 Minimum videos required: {min_videos}")
    print("-" * 70)
    
    # Statistics
    total_actions = 0
    filtered_actions = 0
    total_videos_original = 0
    total_videos_filtered = 0
    skipped_actions = []
    copied_actions = []
    
    # Go through each action folder
    for action in os.listdir(source_path):
        action_source_path = os.path.join(source_path, action)
        
        # Skip if not a directory
        if not os.path.isdir(action_source_path):
            continue
        
        total_actions += 1
        video_count = count_videos_in_action(action_source_path)
        total_videos_original += video_count
        
        print(f"📊 {action}: {video_count} videos", end=" ")
        
        if video_count >= min_videos:
            # Copy the entire action folder
            action_dest_path = os.path.join(destination_path, action)
            
            try:
                # Remove destination folder if it already exists
                if os.path.exists(action_dest_path):
                    shutil.rmtree(action_dest_path)
                
                # Copy the folder
                shutil.copytree(action_source_path, action_dest_path)
                
                filtered_actions += 1
                total_videos_filtered += video_count
                copied_actions.append((action, video_count))
                
                print("✅ COPIED")
                
            except Exception as e:
                print(f"❌ ERROR copying: {e}")
                
        else:
            skipped_actions.append((action, video_count))
            print("⏭️  SKIPPED (too few videos)")
    
    # Display summary
    print("\n" + "="*70)
    print("📊 FILTERING SUMMARY")
    print("="*70)
    
    print(f"Original dataset:")
    print(f"  • Total actions: {total_actions}")
    print(f"  • Total videos: {total_videos_original}")
    
    print(f"\nFiltered dataset:")
    print(f"  • Actions copied: {filtered_actions}")
    print(f"  • Actions skipped: {len(skipped_actions)}")
    print(f"  • Total videos copied: {total_videos_filtered}")
    print(f"  • Retention rate: {(total_videos_filtered/total_videos_original)*100:.1f}% of videos")
    
    # Show copied actions
    if copied_actions:
        print(f"\n✅ COPIED ACTIONS ({len(copied_actions)}):")
        copied_actions.sort(key=lambda x: x[1], reverse=True)  # Sort by video count
        for i, (action, count) in enumerate(copied_actions, 1):
            print(f"  {i:2d}. {action:<25} : {count:4d} videos")
    
    # Show skipped actions
    if skipped_actions:
        print(f"\n⏭️  SKIPPED ACTIONS ({len(skipped_actions)}):")
        skipped_actions.sort(key=lambda x: x[1], reverse=True)  # Sort by video count
        for i, (action, count) in enumerate(skipped_actions, 1):
            print(f"  {i:2d}. {action:<25} : {count:4d} videos")
    
    print("="*70)
    print("✅ Dataset filtering and copying completed!")
    
    return {
        'total_actions': total_actions,
        'filtered_actions': filtered_actions,
        'total_videos_original': total_videos_original,
        'total_videos_filtered': total_videos_filtered,
        'copied_actions': copied_actions,
        'skipped_actions': skipped_actions
    }

def verify_copied_dataset(destination_path):
    """
    Verify that the copied dataset is correct.
    
    Args:
        destination_path (str): Path to the filtered dataset
    """
    print(f"\n🔍 VERIFYING COPIED DATASET at: {destination_path}")
    print("-" * 50)
    
    if not os.path.exists(destination_path):
        print("❌ Destination path does not exist!")
        return
    
    for action in os.listdir(destination_path):
        action_path = os.path.join(destination_path, action)
        if os.path.isdir(action_path):
            video_count = count_videos_in_action(action_path)
            print(f"✅ {action}: {video_count} videos")
    
    print("✅ Verification completed!")

def main():
    """Main function to run the filtering and copying process."""
    print("🎯 DATASET FILTER AND COPIER")
    print("=" * 50)
    
    # Configuration
    SOURCE_PATH = 'dataset'  # Original dataset path
    DESTINATION_PATH = 'filtered_dataset'  # New filtered dataset path
    MIN_VIDEOS = 10  # Minimum number of videos required
    
    # Allow user to customize settings
    try:
        custom_source = input(f"Source dataset path (press Enter for '{SOURCE_PATH}'): ").strip()
        if custom_source:
            SOURCE_PATH = custom_source
        
        custom_dest = input(f"Destination path (press Enter for '{DESTINATION_PATH}'): ").strip()
        if custom_dest:
            DESTINATION_PATH = custom_dest
        
        custom_min = input(f"Minimum videos required (press Enter for {MIN_VIDEOS}): ").strip()
        if custom_min:
            try:
                MIN_VIDEOS = int(custom_min)
            except ValueError:
                print(f"Invalid input, using default: {MIN_VIDEOS}")
        
        print("\n" + "="*50)
        
        # Confirm before proceeding
        confirm = input(f"Proceed with filtering? This will copy actions with {MIN_VIDEOS}+ videos to '{DESTINATION_PATH}' (y/n): ").lower().strip()
        if confirm not in ['y', 'yes']:
            print("Operation cancelled.")
            return
        
    except KeyboardInterrupt:
        print("\nOperation cancelled.")
        return
    
    # Perform the filtering and copying
    results = filter_and_copy_dataset(SOURCE_PATH, DESTINATION_PATH, MIN_VIDEOS)
    
    if results and results['filtered_actions'] > 0:
        # Verify the copied dataset
        verify_copied_dataset(DESTINATION_PATH)
        
        # Ask if user wants to save the report
        try:
            save_report = input("\nSave filtering report to file? (y/n): ").lower().strip()
            if save_report in ['y', 'yes']:
                report_path = 'dataset_filtering_report.txt'
                with open(report_path, 'w') as f:
                    f.write("DATASET FILTERING REPORT\n")
                    f.write("=" * 50 + "\n\n")
                    f.write(f"Source: {SOURCE_PATH}\n")
                    f.write(f"Destination: {DESTINATION_PATH}\n")
                    f.write(f"Minimum videos required: {MIN_VIDEOS}\n\n")
                    
                    f.write(f"Original dataset: {results['total_actions']} actions, {results['total_videos_original']} videos\n")
                    f.write(f"Filtered dataset: {results['filtered_actions']} actions, {results['total_videos_filtered']} videos\n")
                    f.write(f"Retention rate: {(results['total_videos_filtered']/results['total_videos_original'])*100:.1f}%\n\n")
                    
                    f.write("COPIED ACTIONS:\n")
                    for action, count in results['copied_actions']:
                        f.write(f"  {action}: {count} videos\n")
                    
                    f.write("\nSKIPPED ACTIONS:\n")
                    for action, count in results['skipped_actions']:
                        f.write(f"  {action}: {count} videos\n")
                
                print(f"✅ Report saved to: {report_path}")
        
        except KeyboardInterrupt:
            print("\nFiltering completed.")

if __name__ == "__main__":
    main()