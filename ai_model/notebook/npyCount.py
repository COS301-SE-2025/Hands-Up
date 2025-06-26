import os
import shutil
from collections import Counter

def count_npy_files_in_word(word_path):
    """
    Count the number of .npy files in a specific word folder.
    
    Args:
        word_path (str): Path to the word folder
    
    Returns:
        int: Number of .npy files in the folder
    """
    if not os.path.exists(word_path):
        return 0
    
    npy_count = 0
    for file_name in os.listdir(word_path):
        if file_name.lower().endswith('.npy'):
            npy_count += 1
    
    return npy_count

def filter_and_copy_dataset(source_path, destination_path, min_files=10):
    """
    Filter dataset to only include words with minimum number of .npy files and copy to new location.
    
    Args:
        source_path (str): Path to the original dataset
        destination_path (str): Path where filtered dataset will be copied
        min_files (int): Minimum number of .npy files required for a word to be included
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
    print(f"🎯 Minimum .npy files required: {min_files}")
    print("-" * 70)
    
    # Statistics
    total_words = 0
    filtered_words = 0
    total_files_original = 0
    total_files_filtered = 0
    skipped_words = []
    copied_words = []
    
    # Go through each word folder
    for word in os.listdir(source_path):
        word_source_path = os.path.join(source_path, word)
        
        # Skip if not a directory
        if not os.path.isdir(word_source_path):
            continue
        
        total_words += 1
        npy_count = count_npy_files_in_word(word_source_path)
        total_files_original += npy_count
        
        print(f"📊 {word}: {npy_count} .npy files", end=" ")
        
        if npy_count >= min_files:
            # Copy the entire word folder
            word_dest_path = os.path.join(destination_path, word)
            
            try:
                # Remove destination folder if it already exists
                if os.path.exists(word_dest_path):
                    shutil.rmtree(word_dest_path)
                
                # Copy the folder
                shutil.copytree(word_source_path, word_dest_path)
                
                filtered_words += 1
                total_files_filtered += npy_count
                copied_words.append((word, npy_count))
                
                print("✅ COPIED")
                
            except Exception as e:
                print(f"❌ ERROR copying: {e}")
                
        else:
            skipped_words.append((word, npy_count))
            print("⏭️  SKIPPED (too few .npy files)")
    
    # Display summary
    print("\n" + "="*70)
    print("📊 FILTERING SUMMARY")
    print("="*70)
    
    print(f"Original dataset:")
    print(f"  • Total words: {total_words}")
    print(f"  • Total .npy files: {total_files_original}")
    
    print(f"\nFiltered dataset:")
    print(f"  • Words copied: {filtered_words}")
    print(f"  • Words skipped: {len(skipped_words)}")
    print(f"  • Total .npy files copied: {total_files_filtered}")
    print(f"  • Retention rate: {(total_files_filtered/total_files_original)*100:.1f}% of .npy files")
    
    # Show copied words
    if copied_words:
        print(f"\n✅ COPIED WORDS ({len(copied_words)}):")
        copied_words.sort(key=lambda x: x[1], reverse=True)  # Sort by file count
        for i, (word, count) in enumerate(copied_words, 1):
            print(f"  {i:2d}. {word:<25} : {count:4d} .npy files")
    
    # Show skipped words
    if skipped_words:
        print(f"\n⏭️  SKIPPED WORDS ({len(skipped_words)}):")
        skipped_words.sort(key=lambda x: x[1], reverse=True)  # Sort by file count
        for i, (word, count) in enumerate(skipped_words, 1):
            print(f"  {i:2d}. {word:<25} : {count:4d} .npy files")
    
    print("="*70)
    print("✅ Dataset filtering and copying completed!")
    
    return {
        'total_words': total_words,
        'filtered_words': filtered_words,
        'total_files_original': total_files_original,
        'total_files_filtered': total_files_filtered,
        'copied_words': copied_words,
        'skipped_words': skipped_words
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
    
    for word in os.listdir(destination_path):
        word_path = os.path.join(destination_path, word)
        if os.path.isdir(word_path):
            npy_count = count_npy_files_in_word(word_path)
            print(f"✅ {word}: {npy_count} .npy files")
    
    print("✅ Verification completed!")

def main():
    """Main function to run the filtering and copying process."""
    print("🎯 DATASET FILTER AND COPIER (.npy files)")
    print("=" * 50)
    
    # Configuration
    SOURCE_PATH = 'dataset'  # Original dataset path
    DESTINATION_PATH = 'filtered_dataset'  # New filtered dataset path
    MIN_FILES = 10  # Minimum number of .npy files required
    
    # Allow user to customize settings
    try:
        custom_source = input(f"Source dataset path (press Enter for '{SOURCE_PATH}'): ").strip()
        if custom_source:
            SOURCE_PATH = custom_source
        
        custom_dest = input(f"Destination path (press Enter for '{DESTINATION_PATH}'): ").strip()
        if custom_dest:
            DESTINATION_PATH = custom_dest
        
        custom_min = input(f"Minimum .npy files required (press Enter for {MIN_FILES}): ").strip()
        if custom_min:
            try:
                MIN_FILES = int(custom_min)
            except ValueError:
                print(f"Invalid input, using default: {MIN_FILES}")
        
        print("\n" + "="*50)
        
        # Confirm before proceeding
        confirm = input(f"Proceed with filtering? This will copy words with {MIN_FILES}+ .npy files to '{DESTINATION_PATH}' (y/n): ").lower().strip()
        if confirm not in ['y', 'yes']:
            print("Operation cancelled.")
            return
        
    except KeyboardInterrupt:
        print("\nOperation cancelled.")
        return
    
    # Perform the filtering and copying
    results = filter_and_copy_dataset(SOURCE_PATH, DESTINATION_PATH, MIN_FILES)
    
    if results and results['filtered_words'] > 0:
        # Verify the copied dataset
        verify_copied_dataset(DESTINATION_PATH)
        
        # Ask if user wants to save the report
        try:
            save_report = input("\nSave filtering report to file? (y/n): ").lower().strip()
            if save_report in ['y', 'yes']:
                report_path = 'dataset_filtering_report.txt'
                with open(report_path, 'w') as f:
                    f.write("DATASET FILTERING REPORT (.npy files)\n")
                    f.write("=" * 50 + "\n\n")
                    f.write(f"Source: {SOURCE_PATH}\n")
                    f.write(f"Destination: {DESTINATION_PATH}\n")
                    f.write(f"Minimum .npy files required: {MIN_FILES}\n\n")
                    
                    f.write(f"Original dataset: {results['total_words']} words, {results['total_files_original']} .npy files\n")
                    f.write(f"Filtered dataset: {results['filtered_words']} words, {results['total_files_filtered']} .npy files\n")
                    f.write(f"Retention rate: {(results['total_files_filtered']/results['total_files_original'])*100:.1f}%\n\n")
                    
                    f.write("COPIED WORDS:\n")
                    for word, count in results['copied_words']:
                        f.write(f"  {word}: {count} .npy files\n")
                    
                    f.write("\nSKIPPED WORDS:\n")
                    for word, count in results['skipped_words']:
                        f.write(f"  {word}: {count} .npy files\n")
                
                print(f"✅ Report saved to: {report_path}")
        
        except KeyboardInterrupt:
            print("\nFiltering completed.")

if __name__ == "__main__":
    main()